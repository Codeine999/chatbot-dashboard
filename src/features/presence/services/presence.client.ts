import type { Socket } from "socket.io-client";
import { connectAdminSocket } from "@/lib/socket";
import { roomKey, usePresenceStore } from "../store/presence.store";
import {
  isPresenceFailure,
  type PresenceAck,
  type PresenceChannel,
  type PresenceFailure,
  type PresenceRoom,
} from "../types";

/** ค่าเวลาตาม contract: heartbeat ~10s, typing ส่งซ้ำ ~3s, หยุดพิมพ์ ~2.5s, sync ~30s */
export const HEARTBEAT_MS = 10_000;
export const SYNC_INTERVAL_MS = 30_000;
export const TYPING_RESEND_MS = 3_000;
export const TYPING_IDLE_MS = 2_500;
const REQUEST_TIMEOUT_MS = 8_000;

/** DISABLED / UNAUTHORIZED ใน session นี้ = หยุดเรียก presence ทั้งหมด (ฟีเจอร์เสริม ไม่กระทบ inbox) */
let disabled = false;

type TypingState = {
  active: boolean;
  lastSentAt: number;
  idle?: ReturnType<typeof setTimeout>;
};
const typingStates = new Map<string, TypingState>();

/**
 * แปลง platform ของห้องใน inbox เป็น channel ของ presence
 * line → LINE (lineConversation.id), application → APP, messenger → FACEBOOK; ช่องทางอื่นไม่รองรับ
 */
export function toPresenceChannel(platform: string | undefined): PresenceChannel | null {
  switch (platform ?? "line") {
    case "line":
      return "LINE";
    case "application":
      return "APP";
    case "messenger":
      return "FACEBOOK";
    default:
      return null;
  }
}

function readySocket(): Socket | null {
  if (disabled) return null;
  const socket = connectAdminSocket();
  return socket.connected ? socket : null;
}

/** ส่ง event พร้อม ack; error/timeout คืน null (เงียบ ไม่แสดงให้ผู้ใช้เห็น) */
function request<T extends object>(
  socket: Socket,
  event: string,
  payload: object
): Promise<PresenceAck<T> | null> {
  return new Promise((resolve) => {
    socket
      .timeout(REQUEST_TIMEOUT_MS)
      .emit(event, payload, (error: Error | null, ack: PresenceAck<T>) => {
        resolve(error ? null : ack);
      });
  });
}

function handleFailure(reason: PresenceFailure) {
  if (reason === "DISABLED" || reason === "UNAUTHORIZED") {
    disabled = true;
    usePresenceStore.getState().clear();
  }
  // ไม่มีอะไรแสดงให้ผู้ใช้ ดูได้เฉพาะตอน dev
  if (import.meta.env.DEV && reason !== "UNAVAILABLE") {
    console.debug(`[presence] ${reason}`);
  }
}

function getTyping(key: string): TypingState {
  let state = typingStates.get(key);
  if (!state) {
    state = { active: false, lastSentAt: 0 };
    typingStates.set(key, state);
  }
  return state;
}

function sendTyping(channel: PresenceChannel, conversationId: string, typing: boolean) {
  const socket = readySocket();
  if (!socket) return;
  void request(socket, "presence:typing", { channel, conversationId, typing }).then(
    (ack) => {
      if (ack && isPresenceFailure(ack)) handleFailure(ack.reason);
    }
  );
}

async function sync(): Promise<void> {
  const socket = readySocket();
  if (!socket) return;
  const ack = await request<{ rooms: PresenceRoom[] }>(socket, "presence:sync", {});
  if (!ack) return;
  if (isPresenceFailure(ack)) {
    handleFailure(ack.reason);
    return;
  }
  usePresenceStore.getState().replaceAll(ack.rooms);
}

async function join(channel: PresenceChannel, conversationId: string): Promise<void> {
  const socket = readySocket();
  if (!socket) return;
  const ack = await request<{ room: PresenceRoom }>(socket, "presence:join", {
    channel,
    conversationId,
  });
  if (!ack) return;
  if (isPresenceFailure(ack)) {
    handleFailure(ack.reason);
    return;
  }
  usePresenceStore.getState().setRoom(ack.room);
}

async function heartbeat(channel: PresenceChannel, conversationId: string): Promise<void> {
  const socket = readySocket();
  if (!socket) return;
  const ack = await request<{ room: PresenceRoom }>(socket, "presence:heartbeat", {
    channel,
    conversationId,
  });
  if (!ack) return;
  if (isPresenceFailure(ack)) {
    if (ack.reason === "NOT_JOINED") {
      // socket หลุดแล้วต่อใหม่ server จำห้องไม่ได้ จึง join ซ้ำ
      await join(channel, conversationId);
    } else {
      handleFailure(ack.reason);
    }
    return;
  }
  usePresenceStore.getState().setRoom(ack.room);
}

/** ออกจากห้อง พร้อมหยุดสถานะพิมพ์ของห้องนั้น */
function leave(channel: PresenceChannel, conversationId: string): void {
  stopTyping(channel, conversationId);
  const socket = readySocket();
  if (!socket) return;
  void request(socket, "presence:leave", { channel, conversationId }).then((ack) => {
    if (ack && isPresenceFailure(ack)) handleFailure(ack.reason);
  });
}

/** เรียกทุกครั้งที่ช่องพิมพ์เปลี่ยน: ส่ง typing=true ไม่บ่อยกว่าทุก 3s และหยุดเองเมื่อพิมพ์ค้างไว้ 2.5s */
function reportDraft(channel: PresenceChannel, conversationId: string, hasText: boolean): void {
  if (!hasText) {
    stopTyping(channel, conversationId);
    return;
  }

  const state = getTyping(roomKey(channel, conversationId));
  const now = Date.now();
  if (!state.active || now - state.lastSentAt >= TYPING_RESEND_MS) {
    sendTyping(channel, conversationId, true);
    state.active = true;
    state.lastSentAt = now;
  }

  clearTimeout(state.idle);
  state.idle = setTimeout(() => stopTyping(channel, conversationId), TYPING_IDLE_MS);
}

/** หยุดพิมพ์ทันที (ส่ง/blur/เปลี่ยนห้อง); ส่ง typing=false เฉพาะตอนที่เคยส่ง true ไปแล้ว */
function stopTyping(channel: PresenceChannel, conversationId: string): void {
  const key = roomKey(channel, conversationId);
  const state = typingStates.get(key);
  if (!state) return;
  clearTimeout(state.idle);
  typingStates.delete(key);
  if (state.active) sendTyping(channel, conversationId, false);
}

export const presenceClient = {
  isDisabled: () => disabled,
  sync,
  join,
  heartbeat,
  leave,
  reportDraft,
  stopTyping,
};

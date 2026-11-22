import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { connectAdminSocket } from "@/lib/socket";
import {
  HEARTBEAT_MS,
  SYNC_INTERVAL_MS,
  presenceClient,
} from "../services/presence.client";
import { roomKey, usePresenceStore } from "../store/presence.store";
import type { PresenceChannel, PresenceRoom, PresenceViewer } from "../types";

/** true เมื่อแท็บนี้มองเห็นอยู่ (ไม่ได้ซ่อนหรืออยู่เบื้องหลัง) */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState !== "hidden");

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}

/**
 * ผูกกับหน้า inbox ครั้งเดียว: sync ตอน connect/reconnect และทุก ~30s
 * รับ presence:update มาอัปเดต store (ใช้ socket ตัวเดียวกับ ADMIN_NOTIFICATION)
 */
export function usePresenceSession(): void {
  useEffect(() => {
    const socket = connectAdminSocket();

    const onUpdate = (room: PresenceRoom) => usePresenceStore.getState().setRoom(room);
    const onConnect = () => void presenceClient.sync();

    socket.on("presence:update", onUpdate);
    socket.on("connect", onConnect);
    if (socket.connected) void presenceClient.sync();

    const timer = window.setInterval(() => void presenceClient.sync(), SYNC_INTERVAL_MS);

    return () => {
      socket.off("presence:update", onUpdate);
      socket.off("connect", onConnect);
      window.clearInterval(timer);
    };
  }, []);
}

/**
 * บอกว่าเรากำลังเปิดห้องนี้: join ตอนเปิด, heartbeat ทุก ~10s, leave ตอนเปลี่ยนห้อง/ปิด/แท็บซ่อน
 * หลัง reconnect join ซ้ำ เพราะ server จำสถานะต่อ socket ไม่ได้
 */
export function useRoomPresence(
  channel: PresenceChannel | null,
  conversationId: string | undefined
): void {
  const visible = usePageVisible();

  useEffect(() => {
    if (!channel || !conversationId || !visible || presenceClient.isDisabled()) return;

    const socket = connectAdminSocket();
    const join = () => void presenceClient.join(channel, conversationId);

    join();
    socket.on("connect", join);
    const timer = window.setInterval(
      () => void presenceClient.heartbeat(channel, conversationId),
      HEARTBEAT_MS
    );

    return () => {
      socket.off("connect", join);
      window.clearInterval(timer);
      presenceClient.leave(channel, conversationId);
    };
  }, [channel, conversationId, visible]);
}

/** ส่งสถานะกำลังพิมพ์ของช่องพิมพ์ห้องนี้ (ตั้งค่า channel/id เป็น null ได้เมื่อไม่มีห้อง) */
export function usePresenceDraft(channel: PresenceChannel | null, conversationId: string | undefined) {
  return useMemo(
    () => ({
      onChange: (value: string) => {
        if (channel && conversationId) presenceClient.reportDraft(channel, conversationId, value.trim().length > 0);
      },
      stop: () => {
        if (channel && conversationId) presenceClient.stopTyping(channel, conversationId);
      },
    }),
    [channel, conversationId]
  );
}

/** ผู้ดูแลคนอื่นในห้องนี้ (กรองตัวเองออก) */
export function useRoomViewers(
  channel: PresenceChannel | null,
  conversationId: string | undefined
): { others: PresenceViewer[]; typing: PresenceViewer[] } {
  const myId = useAuthStore((state) => state.user?.id);
  const room = usePresenceStore((state) =>
    channel && conversationId ? state.rooms[roomKey(channel, conversationId)] : undefined
  );

  return useMemo(() => {
    const others = (room?.viewers ?? []).filter((viewer) => viewer.adminId !== myId);
    return { others, typing: others.filter((viewer) => viewer.typing) };
  }, [room, myId]);
}

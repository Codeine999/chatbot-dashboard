import { create } from "zustand";
import type { PresenceChannel, PresenceRoom } from "../types";

export const roomKey = (channel: PresenceChannel, conversationId: string) =>
  `${channel}:${conversationId}`;

/** ลายเซ็นของ viewers ใช้เทียบว่ามีอะไรเปลี่ยนไหม เพื่อไม่ให้แถวที่ไม่เปลี่ยนถูก render ใหม่ */
const signature = (room: PresenceRoom) =>
  room.viewers.map((v) => `${v.adminId}|${v.name}|${v.typing ? 1 : 0}`).join(";");

type PresenceState = {
  /** key = `${channel}:${conversationId}` */
  rooms: Record<string, PresenceRoom>;
  /** viewers ว่าง = ห้องนั้นไม่มีใครอยู่แล้ว ให้ลบออก */
  setRoom: (room: PresenceRoom) => void;
  /** แทนที่ทั้งหมดด้วยผลจาก presence:sync */
  replaceAll: (rooms: PresenceRoom[]) => void;
  clear: () => void;
};

export const usePresenceStore = create<PresenceState>()((set) => ({
  rooms: {},

  setRoom: (room) =>
    set((state) => {
      const key = roomKey(room.channel, room.conversationId);
      const current = state.rooms[key];

      if (room.viewers.length === 0) {
        if (!current) return state;
        const next = { ...state.rooms };
        delete next[key];
        return { rooms: next };
      }

      if (current && signature(current) === signature(room)) return state;
      return { rooms: { ...state.rooms, [key]: room } };
    }),

  replaceAll: (rooms) =>
    set({
      rooms: Object.fromEntries(
        rooms
          .filter((room) => room.viewers.length > 0)
          .map((room) => [roomKey(room.channel, room.conversationId), room])
      ),
    }),

  clear: () => set({ rooms: {} }),
}));

import type { AdminChatRoom } from "../type";

export type RoomGroupKey = "today" | "yesterday" | "last7" | "older";

const DAY_MS = 24 * 60 * 60 * 1000;
const GROUP_ORDER: RoomGroupKey[] = ["today", "yesterday", "last7", "older"];

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const groupKeyOf = (iso: string, todayStart: number): RoomGroupKey => {
  const diffDays = Math.floor((todayStart - startOfDay(new Date(iso))) / DAY_MS);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "last7";
  return "older";
};

/** จัดห้องแชทเป็นกลุ่มตามวันที่ใช้งานล่าสุด คงลำดับเดิมในแต่ละกลุ่ม และข้ามกลุ่มที่ว่าง */
export const groupRoomsByDate = (rooms: AdminChatRoom[]) => {
  const todayStart = startOfDay(new Date());
  const buckets = new Map<RoomGroupKey, AdminChatRoom[]>();

  for (const room of rooms) {
    const key = groupKeyOf(room.lastMessageAt, todayStart);
    buckets.set(key, [...(buckets.get(key) ?? []), room]);
  }

  return GROUP_ORDER.filter((key) => buckets.has(key)).map((key) => ({
    key,
    rooms: buckets.get(key) ?? [],
  }));
};

import type { BotMode, LineChatHistory } from "../types/lineChat.type";

/**
 * ระยะเวลาที่บอทถูกพักหลังแอดมินตอบ ตรงกับ AUTO_MUTE_WHEN_REPLY ของ backend (ค่าเริ่มต้น 10m)
 * ถ้าฝั่ง backend ปรับค่านี้ ต้องปรับตรงนี้ตาม เพราะยังไม่มี endpoint บอกเวลาจริง
 */
export const ADMIN_MUTE_WINDOW_MS = 10 * 60 * 1000;

export type BotModeState = {
  mode: BotMode;
  /** epoch ms ที่บอทจะกลับมาตอบเอง มีค่าเฉพาะ mode = "admin" */
  resumesAt?: number;
};

/**
 * backend เก็บสถานะพักบอทไว้ใน Redis และไม่มี endpoint ให้อ่านตรง ๆ
 * แต่กฎมันชัด: ทุกครั้งที่แอดมินส่งข้อความ backend จะตั้ง mute ใหม่เต็มระยะ
 * จึงหาได้จากเวลาข้อความแอดมินล่าสุดในห้อง
 *
 * "paused" (พักเอง) ยังหาจากข้อมูลไม่ได้ จึงไม่มีทางได้ค่านี้จากฟังก์ชันนี้
 */
export const deriveBotMode = (
  messages: LineChatHistory[],
  now: number
): BotModeState => {
  let lastAdminAt = 0;

  for (const message of messages) {
    if (message.sender.toUpperCase() !== "ADMIN") continue;

    const at = new Date(message.createdAt).getTime();
    if (Number.isFinite(at) && at > lastAdminAt) lastAdminAt = at;
  }

  const resumesAt = lastAdminAt + ADMIN_MUTE_WINDOW_MS;

  return lastAdminAt && resumesAt > now
    ? { mode: "admin", resumesAt }
    : { mode: "auto" };
};

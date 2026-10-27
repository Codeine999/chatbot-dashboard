import type { LineChannelState } from "../type";

const MASK = "••••••••••••";

/** ค่าลับที่ไม่ถูกส่งกลับมา แสดงเป็นจุดตามด้วย 4 ตัวท้ายให้จำได้ว่าเป็นของ channel ไหน */
export const maskSecret = (last4: string | null) =>
  last4 ? `${MASK}${last4}` : MASK;

/**
 * webhook URL ของ channel — ใช้ค่าจาก backend ก่อน (ตั้ง PUBLIC_API_BASE_URL ไว้)
 * ถ้าไม่มีก็ประกอบจาก API เดียวกับที่ dashboard เรียกอยู่ เพราะ route เป็นของ backend ตัวนี้
 */
export const resolveWebhookUrl = (state: LineChannelState | undefined) => {
  if (!state?.channelKey) return null;
  if (state.webhookUrl) return state.webhookUrl;

  const base = String(import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
  return base ? `${base}/line/webhooks/${state.channelKey}` : null;
};

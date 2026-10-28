import { z } from "zod";
import type { LineCredentials } from "../type";

// ข้อความ error เก็บเป็น translation key (schema ถูกสร้างครั้งเดียวนอก component)
// FormMessage เป็นคนแปลตอน render — ดู src/components/ui/form.tsx

/**
 * ความยาวที่ LINE กำหนดตายตัวมีแค่ Channel secret (hex 32 ตัว) เท่านั้น
 * Channel ID และ access token ความยาวต่างกันได้ตามบัญชี/ชนิด token จึงตรวจแค่รูปแบบ
 * กับช่วงที่สมเหตุสมผล ไม่ล็อกจำนวนตัวอักษร
 */
export const CHANNEL_SECRET_LENGTH = 32;
const CHANNEL_ID_MIN = 6;
const CHANNEL_ID_MAX = 20;
const ACCESS_TOKEN_MIN = 20;
const ACCESS_TOKEN_MAX = 500;

const key = (name: string) => `settings:connection.validation.${name}`;

export const lineCredentialsSchema = z.object({
  channelId: z
    .string()
    .trim()
    .min(1, key("channelIdRequired"))
    .regex(/^\d+$/, key("channelIdDigits"))
    .min(CHANNEL_ID_MIN, key("channelIdShort"))
    .max(CHANNEL_ID_MAX, key("channelIdLong")),
  channelSecret: z
    .string()
    .trim()
    .min(1, key("secretRequired"))
    .regex(/^[0-9a-fA-F]+$/, key("secretFormat"))
    .length(CHANNEL_SECRET_LENGTH, key("secretLength")),
  channelAccessToken: z
    .string()
    .trim()
    .min(1, key("tokenRequired"))
    // base64 และ JWT: ตัวอักษร ตัวเลข + / = _ - . ห้ามมีช่องว่างหรือขึ้นบรรทัดใหม่
    .regex(/^[A-Za-z0-9+/=._~-]+$/, key("tokenFormat"))
    .min(ACCESS_TOKEN_MIN, key("tokenShort"))
    .max(ACCESS_TOKEN_MAX, key("tokenLong")),
});

// tsconfig ยังไม่เปิด strictNullChecks -> z.infer มองทุก field เป็น optional
// ให้ react-hook-form ใช้ type จาก schema ตรง ๆ แล้ว map เป็น LineCredentials ตอน submit
export type LineCredentialsForm = z.infer<typeof lineCredentialsSchema>;

export const emptyCredentials: LineCredentials = {
  channelId: "",
  channelSecret: "",
  channelAccessToken: "",
};

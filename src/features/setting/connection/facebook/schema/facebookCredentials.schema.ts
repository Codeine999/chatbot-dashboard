import { z } from "zod";
import type { FacebookCredentials } from "../type";

// ข้อความ error เป็น translation key — FormMessage เป็นคนแปลตอน render
const key = (name: string) => `settings:connection.facebook.validation.${name}`;

/** App secret ของ Meta เป็น hex 32 ตัว (ตรงกับที่ backend ตรวจ) */
export const APP_SECRET_LENGTH = 32;
const TOKEN_MAX = 1000;

export const facebookCredentialsSchema = z.object({
  appSecret: z
    .string()
    .trim()
    .min(1, key("secretRequired"))
    .regex(/^[0-9a-fA-F]+$/, key("secretFormat"))
    .length(APP_SECRET_LENGTH, key("secretLength")),
  pageAccessToken: z
    .string()
    .trim()
    .min(1, key("tokenRequired"))
    .regex(/^\S+$/, key("tokenFormat"))
    .max(TOKEN_MAX, key("tokenLong")),
});

// tsconfig ยังไม่เปิด strictNullChecks -> z.infer มองทุก field เป็น optional
export type FacebookCredentialsForm = z.infer<typeof facebookCredentialsSchema>;

export const emptyFacebookCredentials: FacebookCredentials = {
  appSecret: "",
  pageAccessToken: "",
};

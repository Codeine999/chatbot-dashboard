/** ภาษาที่ระบบรองรับ — เพิ่มภาษาใหม่ให้เพิ่มที่นี่ที่เดียว */
export const SUPPORTED_LANGUAGES = ["th", "en"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** ภาษาหลักของระบบ ใช้เป็น fallback เมื่อหา key ในภาษาอื่นไม่เจอ */
export const DEFAULT_LANGUAGE: Language = "th";

/** key ของ localStorage ที่จำภาษาที่ผู้ใช้เลือก (ตั้งชื่อแนวเดียวกับ vite-ui-theme) */
export const LANGUAGE_STORAGE_KEY = "vite-ui-language";

/** ป้ายในตัวสลับภาษา — เขียนด้วยภาษาของตัวเองเสมอ ไม่ต้องแปล */
export const LANGUAGE_LABELS: Record<Language, { native: string; short: string }> = {
  th: { native: "ไทย", short: "TH" },
  en: { native: "English", short: "EN" },
};

/**
 * locale ที่ส่งให้ Intl / toLocaleString
 *
 * หมายเหตุเรื่องปี: "th-TH" เฉย ๆ จะได้ปฏิทินพุทธ (พ.ศ. 2569)
 * ถ้าอยากให้แสดงเป็น ค.ศ. เหมือน backend ให้เปลี่ยนเป็น "th-TH-u-ca-gregory"
 */
export const INTL_LOCALES: Record<Language, string> = {
  th: "th-TH",
  en: "en-US",
};

export const isSupportedLanguage = (value: unknown): value is Language =>
  typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as Language);

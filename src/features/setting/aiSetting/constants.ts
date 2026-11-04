import type { AiEmojiLevel, AiTargetLength } from "./type";

/** เก็บเป็น key ของตัวเลือก ส่วนข้อความให้ i18n แปลตอน render */
export const AI_TONES = [
  "Friendly",
  "Professional",
  "Casual",
  "Formal",
  "Playful",
] as const;

export type AiTonePreset = (typeof AI_TONES)[number];

/** key ของ tone ที่ใช้ใน UI: preset (ตัวเล็ก) หรือ custom เมื่อเป็นข้อความอิสระ */
export type AiToneKey = Lowercase<AiTonePreset> | "custom";

export const AI_TONE_EMOJI: Record<AiToneKey, string> = {
  friendly: "😊",
  professional: "💼",
  casual: "👋",
  formal: "🎩",
  playful: "🎉",
  custom: "✍️",
};

export const isPresetTone = (tone: string): tone is AiTonePreset =>
  (AI_TONES as readonly string[]).includes(tone);

/** tone ว่างคือยังไม่เลือก ส่วนข้อความที่ไม่ใช่ preset คือ custom */
export const toneKeyOf = (tone: string): AiToneKey | null =>
  isPresetTone(tone)
    ? (tone.toLowerCase() as AiToneKey)
    : tone.trim()
      ? "custom"
      : null;

export const AI_TARGET_LENGTHS: AiTargetLength[] = ["short", "medium", "adaptive"];

export const AI_EMOJI_LEVELS: AiEmojiLevel[] = ["none", "light", "normal"];

export const OWNER_PROMPT_MAX = 4_000;
/** จำกัดใน UI สั้นกว่า backend (10,000) ให้ tone เป็นแค่คำอธิบายน้ำเสียง */
export const TONE_MAX = 2_000;
export const FALLBACK_MESSAGE_MAX = 1_000;
export const SKILL_NAME_MAX = 100;
export const SKILL_PROMPT_MAX = 10_000;
export const SKILLS_MAX = 50;

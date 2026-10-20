import type { AiEmojiLevel, AiTargetLength } from "./type";

/** เก็บเป็น key ของตัวเลือก ส่วนข้อความให้ i18n แปลตอน render */
export const AI_TONES = [
  "Friendly",
  "Professional",
  "Casual",
  "Formal",
  "Playful",
] as const;

export const AI_TARGET_LENGTHS: AiTargetLength[] = ["short", "medium", "adaptive"];

export const AI_EMOJI_LEVELS: AiEmojiLevel[] = ["none", "light", "normal"];

export const OWNER_PROMPT_MAX = 4_000;
export const FALLBACK_MESSAGE_MAX = 1_000;
export const SKILL_NAME_MAX = 100;
export const SKILL_PROMPT_MAX = 10_000;
export const SKILLS_MAX = 50;

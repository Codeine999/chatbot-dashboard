import type {
  AiEmojiLevel,
  AiProviderName,
  AiTargetLength,
} from "./type";

/**
 * รายชื่อรุ่นสำรองที่ให้เลือกตอนยังไม่ได้ต่อ GET /api/admin/ai-providers/catalog
 * ค่าต้องตรงกับ AI_PROVIDER_TEXT_MODELS ของ backend เพราะส่งขึ้นไปทั้งสตริง
 */
export const AI_PROVIDER_CATALOG: Record<AiProviderName, string[]> = {
  GEMINI: [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
  ],
  OPENAI: ["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna", "gpt-5", "gpt-5-mini", "gpt-5-nano"],
  ANTHROPIC: [
    "claude-fable-5",
    "claude-opus-5",
    "claude-sonnet-5",
    "claude-haiku-4-5-20251001",
  ],
  MAXPLUS: ["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.5"],
};

/** ชื่อ provider ที่แสดงบน UI ไม่ต้องแปลเพราะเป็นชื่อเฉพาะ */
export const AI_PROVIDER_LABELS: Record<AiProviderName, string> = {
  GEMINI: "Google Gemini",
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic Claude",
  MAXPLUS: "MaxPlus AI",
};

export const AI_PROVIDER_NAMES = Object.keys(
  AI_PROVIDER_CATALOG
) as AiProviderName[];

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

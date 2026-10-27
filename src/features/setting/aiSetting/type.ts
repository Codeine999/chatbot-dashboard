/** ชื่อ provider ตรงกับ enum AiProviderName ฝั่ง backend */
export type AiProviderName = "GEMINI" | "OPENAI" | "ANTHROPIC" | "OPENROUTER";

/** USER = คุยกับลูกค้า, ADMIN = เครื่องมือหลังบ้าน */
export type AiProviderScope = "USER" | "ADMIN";

export type AiModelSelection = {
  provider: AiProviderName;
  model: string;
};

/** หนึ่งรายการจาก GET /api/admin/ai-providers/settings */
export type AiProviderSetting = AiModelSelection & {
  scope: AiProviderScope;
  updatedAt: string;
};

/** หนึ่งรายการจาก GET /api/admin/ai-providers/catalog */
export type AiProviderCatalogItem = {
  provider: AiProviderName;
  label: string;
  /** false เมื่อ backend ยังไม่ได้ตั้ง API key ของ provider นี้ */
  available: boolean;
  models: string[];
};

/** หนึ่งรายการใน skills (Json array) ของ AiSetting */
export type AiSkill = {
  name: string;
  prompt: string;
};

export type AiTargetLength = "short" | "medium" | "adaptive";
export type AiEmojiLevel = "none" | "light" | "normal";

export type AiResponseStyle = {
  targetLength: AiTargetLength;
  emojiLevel: AiEmojiLevel;
};

/** ค่าทั้งหมดที่ฟอร์มหน้านี้แก้ได้ */
export type AiSettingForm = {
  ownerPrompt: string;
  /** เก็บเป็นข้อความอิสระฝั่ง backend จึงส่งค่าใน dropdown ลงไปตรง ๆ */
  tone: string;
  skills: AiSkill[];
  responseStyle: AiResponseStyle;
  fallbackMessage: string;
};

/** หนึ่งรายการจาก GET /api/admin/ai-settings (systemPrompt ส่งมาเฉพาะ dev) */
export type AiSettingRecord = {
  id: string;
  ownerPrompt: string | null;
  tone: string | null;
  /** Json ฝั่ง backend: ตรวจรูปร่างก่อนใช้เสมอ */
  skills: unknown;
  responseStyle: unknown;
  fallbackMessage: string | null;
  promptVersion: number;
  active: boolean;
  updatedAt: string;
};

/** body ของ POST/PATCH /api/admin/ai-settings (ส่งเฉพาะฟิลด์ที่ฟอร์มแก้ได้) */
export type AiSettingPayload = {
  ownerPrompt: string | null;
  tone: string | null;
  skills: AiSkill[];
  responseStyle: AiResponseStyle;
  fallbackMessage: string | null;
};

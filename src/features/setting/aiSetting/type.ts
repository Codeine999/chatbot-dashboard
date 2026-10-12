/** ชื่อ provider ตรงกับ enum AiProviderName ฝั่ง backend */
export type AiProviderName = "GEMINI" | "OPENAI" | "ANTHROPIC" | "MAXPLUS";

/** USER = คุยกับลูกค้า, ADMIN = เครื่องมือหลังบ้าน */
export type AiProviderScope = "USER" | "ADMIN";

export type AiModelSelection = {
  provider: AiProviderName;
  model: string;
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
  userModel: AiModelSelection;
  adminModel: AiModelSelection;
  ownerPrompt: string;
  /** เก็บเป็นข้อความอิสระฝั่ง backend จึงส่งค่าใน dropdown ลงไปตรง ๆ */
  tone: string;
  skills: AiSkill[];
  responseStyle: AiResponseStyle;
  fallbackMessage: string;
};

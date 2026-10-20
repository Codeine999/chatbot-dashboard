export type PreviewSource = "SYSTEM" | "RULE" | "KNOWLEDGE" | "AI" | "REGISTRATION";

export type PreviewSession = { sessionId: string; expiresInSec: number };

export type SendPreviewMessageBody = {
  clientRequestId: string;
  text: string;
  postbackData?: string;
};

export type PreviewReply = {
  /** อาจเป็นสตริงว่างเมื่อบอทไม่ตอบ ส่วนใหญ่เพราะเครดิต AI ไม่พอ */
  text: string;
  source: PreviewSource;
  contextPolicy: "INCLUDE" | "EXCLUDE" | "CLEAR";
  catalogRefs?: { companyId: string; productId: string; variantId?: string }[];
};

export type PreviewSessionState = {
  sessionId: string;
  workflow: {
    flow: "REGISTER" | "GENERAL_QUESTION" | "CHECK_STATUS" | "CONTACT_ADMIN";
    step: string;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  } | null;
  context: {
    role: "user" | "assistant";
    text: string;
    source: "USER" | PreviewSource;
    /** epoch milliseconds */
    createdAt: number;
  }[];
};

/** รายการที่แสดงในหน้าจอ backend ไม่เก็บประวัติแชทให้ */
export type PreviewMessage =
  | { id: string; kind: "customer"; text: string }
  | { id: string; kind: "bot"; text: string; source: PreviewSource }
  | { id: string; kind: "notice"; tone: "muted" | "warning"; text: string };

/** ข้อความที่ส่งไม่สำเร็จ เก็บ clientRequestId เดิมไว้ให้ retry แล้วไม่ตัดเครดิตซ้ำ */
export type FailedPreviewSend = { clientRequestId: string; text: string };

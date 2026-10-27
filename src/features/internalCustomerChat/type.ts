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

/** ช่องทางของแชททดสอบ: line = userview เดิม, line-application = App Message API */
export type ChatChannelType = "line" | "line-application";

export type AppConversation = {
  id: string;
  channel: "APP";
  /** open | waiting_admin */
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  contact: { id: string; displayName: string | null; metadata: unknown };
};

/** admin API คืน USER/AI/ADMIN/SYSTEM แต่ guest API คืนตัวพิมพ์เล็ก จึงรับทั้งสองแบบ */
export type AppSender = "USER" | "AI" | "ADMIN" | "SYSTEM" | "user" | "ai" | "admin" | "system";

export type AppHistoryMessage = {
  id: string;
  conversationId: string;
  sender: AppSender;
  messageType: string;
  text?: string | null;
  sentStatus: string;
  metadata?: { source?: string; handoff?: boolean } | null;
  createdAt: string;
};

export type AppGuestSession = { sessionToken: string; guestId: string; expiresAt: string };

export type AppGuestInfo = {
  guestId: string;
  /** null จนกว่าจะส่งข้อความแรก */
  conversationId: string | null;
  botMode: "auto" | "admin";
  expiresAt: string;
};

export type AppGuestSendBody = { clientMessageId: string; text: string };

export type AppGuestSendResult = {
  meta: { status: string; source: string; handoff: boolean; botMode: "auto" | "admin" };
};

/** guest ทดสอบที่เก็บไว้ใน sessionStorage (token แสดงครั้งเดียวตอนสร้าง) */
export type StoredAppGuest = { token: string; guestId: string };

export type FailedAppSend = { clientMessageId: string; text: string };

export type LineChatSender = "USER" | "ADMIN" | "AI" | "SYSTEM" | "user" | "admin" | "ai" | "system";

export type LineChatMessageType =
  | "TEXT"
  | "IMAGE"
  | "STICKER"
  | "POSTBACK"
  | "text"
  | "image"
  | "sticker"
  | "postback";

export type LineMember = {
  id: string;
  memberId?: string | null;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string | null;
  statusMessage?: string | null;
  lastActiveAt?: string | null;
  profileSyncedAt?: string | null;
};

export type LineConversation = {
  id: string;
  lineMemberId: string;
  status: string;
  lastMessage: string;
  lastMessageType: LineChatMessageType;
  lastMessageAt: string;
  unreadCount: number;
  lineMember: LineMember;
};

export type LineChatHistory = {
  id: string;
  conversationId: string;
  lineMemberId: string;
  sender: LineChatSender;
  messageType: LineChatMessageType;
  text?: string | null;
  lineMessageId?: string | null;
  replyToken?: string | null;
  stickerPackageId?: string | null;
  stickerId?: string | null;
  stickerResourceType?: string | null;
  mediaUrl?: string | null;
  postbackData?: string | null;
  sentStatus: string;
  createdAt: string;
};

import type { LucideIcon } from "lucide-react";

export type ChatSuggestion = {
  icon: LucideIcon;
  title: string;
  description: string;
  prompt: string;
};

export type AiProviderName = "GEMINI" | "OPENAI" | "ANTHROPIC";

export type AiProviderCatalogItem = {
  provider: AiProviderName;
  label: string;
  available: boolean;
  models: string[];
};

/**
 * Every admin answers with the same provider/model — this is the shared
 * back-office setting, not a per-account one. Only dev/owner may change it.
 */
export type AdminAiProviderSetting = {
  adminMemberId: string;
  role: "dev" | "owner" | "admin";
  enabled: boolean;
  provider: AiProviderName;
  model: string;
  updatedAt: string;
};

export type AdminChatRoom = {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
};

export type AdminChatRole = "USER" | "ASSISTANT";

export type AdminChatMessage = {
  id: string;
  role: AdminChatRole;
  content: string;
  provider: AiProviderName | null;
  model: string | null;
  createdAt: string;
};

/**
 * No provider/model here on purpose — the backend reads the answering model
 * from the stored ADMIN-scope setting and ignores anything in the body.
 * Changing the model is a separate call to updateMyProviderSetting.
 */
export type SendAdminChatInput = {
  roomId?: string;
  text: string;
};

export type UpdateAiProviderSettingInput = {
  provider: AiProviderName;
  model: string;
};

export type SendAdminChatResult = {
  roomId: string;
  roomTitle: string;
  userMessage: AdminChatMessage;
  reply: AdminChatMessage;
};

export type AdminAiUsage = {
  adminMemberId: string;
  username: string;
  firstname: string;
  lastname: string;
  role: string;
  messageCount: number;
  lastUsedAt: string | null;
  customerReplyCount: number;
  chargedCreditTotal: string;
  usedCredit: string;
  limitCredit: string | null;
};

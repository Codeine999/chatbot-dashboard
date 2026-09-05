import { api } from "@/api/api";
import type {
  AdminAiUsage,
  AdminAiProviderSetting,
  AdminChatMessage,
  AdminChatRoom,
  AiProviderCatalogItem,
  SendAdminChatInput,
  SendAdminChatResult,
  UpdateAiProviderSettingInput,
} from "../type";

export const adminChatApi = {
  listRooms: async (): Promise<AdminChatRoom[]> => {
    const res = await api.get<AdminChatRoom[]>("/admin/ai-chat/rooms");
    return res.data;
  },

  listMessages: async (roomId: string): Promise<AdminChatMessage[]> => {
    const res = await api.get<AdminChatMessage[]>(
      `/admin/ai-chat/rooms/${roomId}/messages`
    );
    return res.data;
  },

  createRoom: async (title?: string): Promise<AdminChatRoom> => {
    const res = await api.post<AdminChatRoom>("/admin/ai-chat/rooms", {
      ...(title ? { title } : {}),
    });
    return res.data;
  },

  sendMessage: async (
    input: SendAdminChatInput
  ): Promise<SendAdminChatResult> => {
    const res = await api.post<SendAdminChatResult>(
      "/admin/ai-chat/messages",
      input,
      // Reasoning models can legitimately take longer than the global 15s.
      { timeout: 120_000 }
    );
    return res.data;
  },

  renameRoom: async (roomId: string, title: string): Promise<AdminChatRoom> => {
    const res = await api.patch<AdminChatRoom>(
      `/admin/ai-chat/rooms/${roomId}`,
      { title }
    );
    return res.data;
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    // The axios instance sets Content-Type: application/json globally and
    // Fastify rejects that header with an empty body, so send `{}`.
    await api.delete(`/admin/ai-chat/rooms/${roomId}`, { data: {} });
  },

  getMyUsage: async (): Promise<AdminAiUsage> => {
    const res = await api.get<AdminAiUsage>("/admin/ai-chat/usage/me");
    return res.data;
  },

  /** dev/owner only — usage for every admin account. */
  listAllUsage: async (): Promise<AdminAiUsage[]> => {
    const res = await api.get<AdminAiUsage[]>("/admin/ai-chat/usage");
    return res.data;
  },

  getMyProviderCatalog: async (): Promise<AiProviderCatalogItem[]> => {
    const res = await api.get<AiProviderCatalogItem[]>(
      "/admin/ai-providers/catalog/me"
    );
    return res.data;
  },

  getMyProviderSetting: async (): Promise<AdminAiProviderSetting> => {
    const res = await api.get<AdminAiProviderSetting>(
      "/admin/ai-providers/settings/me"
    );
    return res.data;
  },

  /**
   * Publishes the answering model for the whole back office. dev/owner only —
   * the `admin` role gets 403 and sees the picker read-only.
   */
  updateMyProviderSetting: async (
    input: UpdateAiProviderSettingInput
  ): Promise<AdminAiProviderSetting> => {
    const res = await api.patch<AdminAiProviderSetting>(
      "/admin/ai-providers/settings/me",
      input
    );
    return res.data;
  },
};

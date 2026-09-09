import { api } from "@/api/api";

export type AiProviderSetting = {
  scope: string;
  provider: string;
  model: string;
  updatedAt: string;
};

export type AiProviderCatalogItem = {
  provider: string;
  label: string;
  available: boolean;
  models: string[];
};

export type UpdateAdminAiProviderSettingInput = {
  scope: "ADMIN";
  provider: string;
  model: string;
};

export type LineBotInfo = {
  userId: string;
  basicId: string;
  premiumId?: string;
  displayName: string;
  pictureUrl?: string;
  chatMode: "chat" | "bot";
  markAsReadMode: "auto" | "manual";
  aiProviderSettings?: AiProviderSetting[];
};

export type LineFollowerStats = {
  status: "ready" | "unready" | "out_of_service";
  followers: number | null;
  targetedReaches: number | null;
  blocks: number | null;
  changePercent: number | null;
  sinceDate: string | null;
};

export type LineMessageUsage = {
  sentThisMonth: { period: string; count: number };
  quotaUsed: number;
};

export const lineOaApi = {
  getInfo: async (): Promise<LineBotInfo> => {
    const res = await api.get<LineBotInfo>("/line/admin/info");
    return res.data;
  },

  getFollowers: async (): Promise<LineFollowerStats> => {
    const res = await api.get<LineFollowerStats>("/line/admin/followers");
    return res.data;
  },

  getMessageUsage: async (): Promise<LineMessageUsage> => {
    const res = await api.get<LineMessageUsage>(
      "/line/admin/message-usage"
    );
    return res.data;
  },

  getMyAiProviderCatalog: async (): Promise<AiProviderCatalogItem[]> => {
    const res = await api.get<AiProviderCatalogItem[]>(
      "/admin/ai-providers/catalog/me"
    );
    return res.data;
  },

  updateAdminAiProviderSetting: async (
    input: UpdateAdminAiProviderSettingInput
  ): Promise<AiProviderSetting> => {
    const res = await api.patch<AiProviderSetting>(
      "/admin/ai-providers/settings/me",
      input
    );
    return res.data;
  },
};

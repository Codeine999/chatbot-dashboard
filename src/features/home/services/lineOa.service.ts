import { api } from "@/api/api";

export type LineBotInfo = {
  userId: string;
  basicId: string;
  premiumId?: string;
  displayName: string;
  pictureUrl?: string;
  chatMode: "chat" | "bot";
  markAsReadMode: "auto" | "manual";
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
};

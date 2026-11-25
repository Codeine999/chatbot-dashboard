export type ChatChannelFilter = "all" | "line" | "facebook" | "api";

export type ChatChannelKey = Exclude<ChatChannelFilter, "all">;

export type ChatChannelStat = {
  key: ChatChannelKey;
  count: number;
  percent: number;
  color: string;
};

export type ChatTopicKey = "knowledge" | "product" | "general" | "handoff";

export type ChatTopicStat = {
  key: ChatTopicKey;
  count: number;
  percent: number;
  color: string;
};

export type RecentChatTurn = {
  id: string;
  createdAt: string;
  channel: ChatChannelKey | null;
  respondedBy: "AI" | "ADMIN";
  adminUsername: string | null;
  answerType: string | null;
  status: "success" | "failed";
};

export type ChatAnalyticsSummary = {
  totalMessages30d: number;
  aiResolutionPercent: number;
  adminHandoffPercent: number;
  avgResponseSec: number;
  channels: ChatChannelStat[];
  topics: ChatTopicStat[];
  recentTurns: RecentChatTurn[];
  isSample: boolean;
};

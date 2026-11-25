import { analyticsApi } from "@/features/usage/services/analytics.service";
import {
  usageApi,
  type UsageReplyChannel,
  type UsageReplyItem,
} from "@/features/usage/services/usage.service";
import {
  MOCK_CHAT_CHANNELS,
  MOCK_CHAT_TOPICS,
  buildMockRecentTurns,
} from "../mock/chatAnalytics.mock";
import type {
  ChatAnalyticsSummary,
  ChatChannelKey,
  ChatChannelStat,
  ChatTopicKey,
  ChatTopicStat,
  RecentChatTurn,
} from "../types/chatAnalytics.type";

const CHANNEL_MAP: Record<UsageReplyChannel, ChatChannelKey> = {
  LINE: "line",
  FACEBOOK: "facebook",
  APPLICATION: "api",
};

const CHANNEL_COLORS: Record<ChatChannelKey, string> = {
  line: "#16a34a",
  facebook: "#2563eb",
  api: "#8b5cf6",
};

const TOPIC_COLORS: Record<ChatTopicKey, string> = {
  knowledge: "#5048e4",
  product: "#0d9488",
  general: "#8b5cf6",
  handoff: "#ea580c",
};

const toTopicKey = (item: UsageReplyItem): ChatTopicKey => {
  if (item.respondedBy === "ADMIN") return "handoff";
  const upper = (item.answerType ?? "").toUpperCase();
  if (upper.includes("PRODUCT") || upper.includes("ORDER")) return "product";
  if (upper.includes("KNOWLEDGE") || upper.includes("FAQ")) return "knowledge";
  return "general";
};

const toChannelStats = (items: UsageReplyItem[]): ChatChannelStat[] => {
  const counts: Record<ChatChannelKey, number> = {
    line: 0,
    facebook: 0,
    api: 0,
  };

  for (const item of items) {
    if (item.channel) {
      counts[CHANNEL_MAP[item.channel]] += 1;
    }
  }

  const total = counts.line + counts.facebook + counts.api;
  if (total === 0) return MOCK_CHAT_CHANNELS;

  return (["line", "facebook", "api"] as const).map((key) => ({
    key,
    count: counts[key],
    percent: Math.round((counts[key] / total) * 100),
    color: CHANNEL_COLORS[key],
  }));
};

const toTopicStats = (items: UsageReplyItem[]): ChatTopicStat[] => {
  if (items.length === 0) return MOCK_CHAT_TOPICS;

  const counts: Record<ChatTopicKey, number> = {
    knowledge: 0,
    product: 0,
    general: 0,
    handoff: 0,
  };

  for (const item of items) {
    counts[toTopicKey(item)] += 1;
  }

  const total = items.length;
  return (["knowledge", "product", "general", "handoff"] as const).map(
    (key) => ({
      key,
      count: counts[key],
      percent: Math.round((counts[key] / total) * 100),
      color: TOPIC_COLORS[key],
    })
  );
};

const toRecentTurn = (item: UsageReplyItem): RecentChatTurn => ({
  id: item.id,
  createdAt: item.createdAt,
  channel: item.channel ? CHANNEL_MAP[item.channel] : null,
  respondedBy: item.respondedBy,
  adminUsername: item.adminUsername,
  answerType: item.answerType,
  status: item.status,
});

export const chatAnalyticsService = {
  getSummary: async (): Promise<ChatAnalyticsSummary> => {
    const [chatSeriesResult, repliesResult] = await Promise.allSettled([
      analyticsApi.getSeries("chat", "day"),
      usageApi.getUsageReplies({ page: 1, limit: 25 }),
    ]);

    const chatSeries =
      chatSeriesResult.status === "fulfilled" ? chatSeriesResult.value : null;
    const repliesPage =
      repliesResult.status === "fulfilled" ? repliesResult.value : null;

    const replyItems = repliesPage?.items ?? [];
    const hasRealReplies = replyItems.length > 0;

    // คำนวณสัดส่วน AI vs Admin จากข้อมูลจริงในชุดช่วง 30 วัน ถ้ามี
    let aiCount = 0;
    let adminCount = 0;
    if (chatSeries && !chatSeries.isSample) {
      for (const point of chatSeries.points) {
        aiCount += Number(point.ai ?? 0);
        adminCount += Number(point.admin ?? 0);
      }
    } else if (hasRealReplies) {
      for (const item of replyItems) {
        if (item.respondedBy === "AI") aiCount += 1;
        else adminCount += 1;
      }
    }

    const totalReplies = aiCount + adminCount;
    const aiResolutionPercent =
      totalReplies > 0 ? Math.round((aiCount / totalReplies) * 100) : 87;
    const adminHandoffPercent =
      totalReplies > 0 ? 100 - aiResolutionPercent : 13;

    return {
      totalMessages30d: chatSeries?.headline ?? 1240,
      aiResolutionPercent,
      adminHandoffPercent,
      avgResponseSec: 2.4,
      channels: hasRealReplies ? toChannelStats(replyItems) : MOCK_CHAT_CHANNELS,
      topics: hasRealReplies ? toTopicStats(replyItems) : MOCK_CHAT_TOPICS,
      recentTurns: hasRealReplies
        ? replyItems.slice(0, 8).map(toRecentTurn)
        : buildMockRecentTurns(),
      isSample: Boolean(chatSeries?.isSample ?? true) && !hasRealReplies,
    };
  },
};

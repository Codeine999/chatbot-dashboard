import type {
  ChatChannelStat,
  ChatTopicStat,
  RecentChatTurn,
} from "../types/chatAnalytics.type";

export const MOCK_CHAT_CHANNELS: ChatChannelStat[] = [
  { key: "line", count: 842, percent: 68, color: "#16a34a" },
  { key: "facebook", count: 274, percent: 22, color: "#2563eb" },
  { key: "api", count: 124, percent: 10, color: "#8b5cf6" },
];

export const MOCK_CHAT_TOPICS: ChatTopicStat[] = [
  { key: "knowledge", count: 540, percent: 44, color: "#5048e4" },
  { key: "product", count: 385, percent: 31, color: "#0d9488" },
  { key: "general", count: 160, percent: 13, color: "#8b5cf6" },
  { key: "handoff", count: 155, percent: 12, color: "#ea580c" },
];

export const buildMockRecentTurns = (now = new Date()): RecentChatTurn[] => {
  const minutesAgo = (mins: number) =>
    new Date(now.getTime() - mins * 60_000).toISOString();

  return [
    {
      id: "mock-turn-1",
      createdAt: minutesAgo(8),
      channel: "line",
      respondedBy: "AI",
      adminUsername: null,
      answerType: "KNOWLEDGE",
      status: "success",
    },
    {
      id: "mock-turn-2",
      createdAt: minutesAgo(24),
      channel: "facebook",
      respondedBy: "AI",
      adminUsername: null,
      answerType: "PRODUCT",
      status: "success",
    },
    {
      id: "mock-turn-3",
      createdAt: minutesAgo(47),
      channel: "line",
      respondedBy: "ADMIN",
      adminUsername: "admin",
      answerType: "HANDOFF",
      status: "success",
    },
    {
      id: "mock-turn-4",
      createdAt: minutesAgo(95),
      channel: "api",
      respondedBy: "AI",
      adminUsername: null,
      answerType: "GENERAL",
      status: "success",
    },
    {
      id: "mock-turn-5",
      createdAt: minutesAgo(140),
      channel: "line",
      respondedBy: "AI",
      adminUsername: null,
      answerType: "PRODUCT",
      status: "success",
    },
  ];
};

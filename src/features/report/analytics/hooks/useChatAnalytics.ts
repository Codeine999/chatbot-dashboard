import { useQuery } from "@tanstack/react-query";
import { chatAnalyticsService } from "../services/chatAnalytics.service";

export const CHAT_ANALYTICS_QUERY_KEY = ["report", "analytics", "chat"] as const;

export const useChatAnalytics = () =>
  useQuery({
    queryKey: CHAT_ANALYTICS_QUERY_KEY,
    queryFn: chatAnalyticsService.getSummary,
    staleTime: 60_000,
  });

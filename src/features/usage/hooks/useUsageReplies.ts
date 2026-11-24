import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usageApi, type UsageReplyChannel } from "../services/usage.service";

export const USAGE_REPLIES_PAGE_SIZE = 10;

export function useUsageReplies(channel: UsageReplyChannel | undefined, page: number) {
  return useQuery({
    queryKey: ["admin", "usage", "replies", channel ?? "all", page],
    queryFn: () => usageApi.getUsageReplies({ channel, page, limit: USAGE_REPLIES_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
}

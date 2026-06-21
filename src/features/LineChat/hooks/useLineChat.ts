import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { lineChatApi } from "../services/lineChat.service";
import type { LineChatHistory } from "../types/lineChat.type";

const POLL_INTERVAL_MS = 2000;

export function useConversations() {
  return useQuery({
    queryKey: ["line-conversations"],
    queryFn: lineChatApi.getConversations,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useConversationMessages(conversationId?: string) {
  return useInfiniteQuery({
    queryKey: ["line-conversation-messages", conversationId],
    enabled: Boolean(conversationId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      lineChatApi.getConversationMessages({
        conversationId: conversationId ?? "",
        before: pageParam,
        limit: 30,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 30) return undefined;
      return lastPage[0]?.createdAt;
    },
  });
}

export function usePollConversationMessages(conversationId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const queryKey = ["line-conversation-messages", conversationId];

    const pollLatestMessages = async () => {
      const current = queryClient.getQueryData<{
        pages: LineChatHistory[][];
        pageParams: unknown[];
      }>(queryKey);

      const messages = current?.pages?.flat() ?? [];
      const latestMessage = messages.reduce<LineChatHistory | undefined>(
        (latest, message) => {
          if (!latest) return message;
          return new Date(message.createdAt).getTime() >
            new Date(latest.createdAt).getTime()
            ? message
            : latest;
        },
        undefined
      );

      if (!latestMessage) return;

      const newMessages = await lineChatApi.getConversationMessages({
        conversationId,
        after: latestMessage.createdAt,
        limit: 100,
      });

      if (newMessages.length === 0) return;

      queryClient.setQueryData(queryKey, (data: any) => {
        if (!data?.pages?.length) return data;

        const existingIds = new Set(
          data.pages.flat().map((message: LineChatHistory) => message.id)
        );
        const uniqueMessages = newMessages.filter(
          (message) => !existingIds.has(message.id)
        );

        if (uniqueMessages.length === 0) return data;

        return {
          ...data,
          pages: data.pages.map((page: LineChatHistory[], index: number) =>
            index === 0 ? [...page, ...uniqueMessages] : page
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["line-conversations"] });
    };

    const intervalId = window.setInterval(() => {
      void pollLatestMessages();
    }, POLL_INTERVAL_MS);

    void pollLatestMessages();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [conversationId, queryClient]);
}

export function useSendLineMessage(conversationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) =>
      lineChatApi.sendMessage({
        conversationId: conversationId ?? "",
        text,
      }),
    onSuccess: (message) => {
      queryClient.setQueryData(
        ["line-conversation-messages", conversationId],
        (current: any) => {
          if (!current?.pages?.length) return current;

          return {
            ...current,
            pages: current.pages.map((page: any[], index: number) =>
              index === 0 ? [...page, message] : page
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["line-conversations"] });
    },
  });
}

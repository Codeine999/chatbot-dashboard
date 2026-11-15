import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import { lineChatApi } from "../services/lineChat.service";
import type { BotMode, LineChatHistory, LineConversation } from "../types/lineChat.type";

const POLL_INTERVAL_MS = 2000;
const MESSAGE_PAGE_SIZE = 20;

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
        limit: MESSAGE_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.length < MESSAGE_PAGE_SIZE) return undefined;
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
        clientRequestId: crypto.randomUUID(),
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

const BOT_MODE_TOAST: Record<BotMode, { ok: string; failed: string }> = {
  auto: { ok: "chat:line.bot.resumed", failed: "chat:line.bot.resumeFailed" },
  admin: { ok: "chat:line.bot.held", failed: "chat:line.bot.holdFailed" },
  paused: { ok: "chat:line.bot.paused", failed: "chat:line.bot.pauseFailed" },
};

/** เปลี่ยนโหมดบอทของห้อง: auto = resume-bot, admin = admin-hold, paused = pause-bot */
export function useChangeBotMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, mode }: { conversationId: string; mode: BotMode }) => {
      if (mode === "admin") return lineChatApi.adminHold(conversationId);
      if (mode === "paused") return lineChatApi.pauseBot(conversationId);
      // resume-bot ตอบแค่ status ให้ถือว่ากลับเป็น auto
      const res = await lineChatApi.resumeBot(conversationId);
      return { status: res.status, botMode: "auto" as const, botMuteUntil: null };
    },
    onSuccess: (result, { conversationId, mode }) => {
      // แก้ห้องใน cache ทันที ไม่รอ poll รอบถัดไป (getConversations คืน array เสมอ)
      queryClient.setQueryData(["line-conversations"], (current: unknown) => {
        const patch = (room: LineConversation) =>
          room.id === conversationId
            ? {
                ...room,
                botMode: result.botMode,
                botMuteUntil: result.botMuteUntil,
                status: result.status ?? room.status,
              }
            : room;
        return Array.isArray(current) ? current.map(patch) : current;
      });
      void queryClient.invalidateQueries({ queryKey: ["line-conversations"] });
      toast.success(i18n.t(BOT_MODE_TOAST[mode].ok));
    },
    onError: (error, { mode }) => {
      toast.error(getApiErrorMessage(error, i18n.t(BOT_MODE_TOAST[mode].failed)));
    },
  });
}

/**
 * เคลียร์ unreadCount ของห้องที่แอดมินเปิดอยู่ หลังโหลดข้อความแล้ว
 * และเคลียร์อีกครั้งเมื่อมีข้อความใหม่เข้ามาขณะเปิดห้องค้างไว้ (ยิงครั้งเดียวต่อค่า unreadCount)
 */
export function useMarkLineConversationRead(
  conversationId: string | undefined,
  unreadCount: number | undefined,
  ready: boolean
) {
  const queryClient = useQueryClient();
  const sentRef = useRef("");
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!conversationId) return;
    // กลับเป็น 0 แล้ว: ถ้ามีข้อความใหม่จนได้ค่าเดิมซ้ำ (เช่น 2 -> 0 -> 2) ต้องยิงใหม่ได้
    if (!unreadCount) {
      sentRef.current = "";
      return;
    }
    if (!ready) return;
    const key = `${conversationId}:${unreadCount}`;
    if (sentRef.current === key) return;
    sentRef.current = key;

    lineChatApi
      .markRead(conversationId)
      .then(() => queryClient.invalidateQueries({ queryKey: ["line-conversations"] }))
      .catch(() => {
        // ลองใหม่ใน 5 วินาที (deps ไม่เปลี่ยน effect จะไม่รันเองถ้าไม่ขยับ tick)
        sentRef.current = "";
        window.setTimeout(() => setRetryTick((tick) => tick + 1), 5000);
      });
  }, [conversationId, unreadCount, ready, queryClient, retryTick]);
}

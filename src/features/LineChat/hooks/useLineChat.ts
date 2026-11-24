import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import { inboxApi } from "../services/inboxApi";
import type { ConversationPage } from "../services/lineChat.service";
import type {
  BotMode,
  ConversationPlatform,
  LineChatHistory,
  LineConversation,
} from "../types/lineChat.type";

const POLL_INTERVAL_MS = 2000;
const MESSAGE_PAGE_SIZE = 20;

const CONVERSATION_PAGE_SIZE = 30;

/** cache ของรายการห้องแยกตามช่องทาง (LINE ใช้ key เดิม) */
export const conversationsKey = (platform: ConversationPlatform | undefined) =>
  platform === "messenger" ? (["facebook-conversations"] as const) : (["line-conversations"] as const);

/** รายการห้องของช่องทางเดียวแบบแบ่งหน้า (cursor) poll จะดึงทุกหน้าที่โหลดไว้ใหม่ตามลำดับ */
function useChannelConversations(platform: "line" | "messenger") {
  return useInfiniteQuery({
    queryKey: conversationsKey(platform),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      inboxApi(platform).getConversations({ limit: CONVERSATION_PAGE_SIZE, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: POLL_INTERVAL_MS,
    // ห้องที่ขยับขึ้นมาระหว่างโหลดหน้าถัดไปอาจซ้ำข้ามหน้า จึงตัดซ้ำตาม id
    select: (data) => {
      const seen = new Set<string>();
      return data.pages
        .flatMap((page) => page.items)
        .filter((room) => (seen.has(room.id) ? false : (seen.add(room.id), true)));
    },
  });
}

const EMPTY_ROOMS: LineConversation[] = [];

/**
 * รายการห้องรวมทุกช่องทาง (LINE + Facebook) หน้าแชทกรองตามช่องทางเอง
 * ช่องทางหนึ่งโหลดไม่สำเร็จไม่ทำให้อีกช่องทางหาย: ถือว่า error เมื่อล้มทั้งคู่เท่านั้น
 */
export function useConversations() {
  const line = useChannelConversations("line");
  const facebook = useChannelConversations("messenger");
  const lineRooms = line.data ?? EMPTY_ROOMS;
  const facebookRooms = facebook.data ?? EMPTY_ROOMS;

  const data = useMemo(() => [...lineRooms, ...facebookRooms], [lineRooms, facebookRooms]);

  return {
    data,
    isLoading: line.isLoading || facebook.isLoading,
    isError: line.isError && facebook.isError,
    hasNextPage: Boolean(line.hasNextPage || facebook.hasNextPage),
    isFetchingNextPage: line.isFetchingNextPage || facebook.isFetchingNextPage,
    fetchNextPage: async () => {
      await Promise.all([
        line.hasNextPage ? line.fetchNextPage() : undefined,
        facebook.hasNextPage ? facebook.fetchNextPage() : undefined,
      ]);
    },
  };
}

export function useConversationMessages(
  conversationId?: string,
  platform?: ConversationPlatform
) {
  return useInfiniteQuery({
    queryKey: ["line-conversation-messages", conversationId],
    enabled: Boolean(conversationId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      inboxApi(platform).getConversationMessages({
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

export function usePollConversationMessages(
  conversationId?: string,
  platform?: ConversationPlatform
) {
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

      const newMessages = await inboxApi(platform).getConversationMessages({
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

      queryClient.invalidateQueries({ queryKey: conversationsKey(platform) });
    };

    const intervalId = window.setInterval(() => {
      void pollLatestMessages();
    }, POLL_INTERVAL_MS);

    void pollLatestMessages();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [conversationId, platform, queryClient]);
}

export function useSendLineMessage(conversationId?: string, platform?: ConversationPlatform) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) =>
      inboxApi(platform).sendMessage({
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
      queryClient.invalidateQueries({ queryKey: conversationsKey(platform) });
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
    mutationFn: async ({
      conversationId,
      mode,
      platform,
    }: {
      conversationId: string;
      mode: BotMode;
      platform?: ConversationPlatform;
    }) => {
      const api = inboxApi(platform);
      if (mode === "admin") return api.adminHold(conversationId);
      if (mode === "paused") return api.pauseBot(conversationId);
      // resume-bot ตอบแค่ status ให้ถือว่ากลับเป็น auto
      const res = await api.resumeBot(conversationId);
      return { status: res.status, botMode: "auto" as const, botMuteUntil: null };
    },
    onSuccess: (result, { conversationId, mode, platform }) => {
      // แก้ห้องใน cache ทันที ไม่รอ poll รอบถัดไป (โครงสร้างแบบแบ่งหน้า)
      queryClient.setQueryData(conversationsKey(platform), (current: InfiniteData<ConversationPage> | undefined) => {
        const patch = (room: LineConversation) =>
          room.id === conversationId
            ? {
                ...room,
                botMode: result.botMode,
                botMuteUntil: result.botMuteUntil,
                status: result.status ?? room.status,
              }
            : room;
        if (!current?.pages) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({ ...page, items: page.items.map(patch) })),
        };
      });
      void queryClient.invalidateQueries({ queryKey: conversationsKey(platform) });
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
  ready: boolean,
  platform?: ConversationPlatform
) {
  const queryClient = useQueryClient();
  const sentRef = useRef("");
  const [retryTick, setRetryTick] = useState(0);
  const failuresRef = useRef(0);

  useEffect(() => {
    if (!conversationId) return;
    // กลับเป็น 0 แล้ว: ถ้ามีข้อความใหม่จนได้ค่าเดิมซ้ำ (เช่น 2 -> 0 -> 2) ต้องยิงใหม่ได้
    if (!unreadCount) {
      sentRef.current = "";
      failuresRef.current = 0;
      return;
    }
    if (!ready) return;
    const key = `${conversationId}:${unreadCount}`;
    if (sentRef.current === key) return;
    sentRef.current = key;

    inboxApi(platform)
      .markRead(conversationId)
      .then(() => queryClient.invalidateQueries({ queryKey: conversationsKey(platform) }))
      .then(() => {
        failuresRef.current = 0;
      })
      .catch(() => {
        // ลองใหม่ไม่เกิน 3 ครั้ง (เช่น backend ยังไม่มี endpoint /read จะได้ไม่ยิงซ้ำทุก 5 วินาทีตลอดไป)
        // เลขที่ค้างเป็นแค่ badge ไม่กระทบการใช้งานอื่น
        failuresRef.current += 1;
        if (failuresRef.current >= 3) return;
        sentRef.current = "";
        window.setTimeout(() => setRetryTick((tick) => tick + 1), 5000);
      });
  }, [conversationId, unreadCount, ready, platform, queryClient, retryTick]);
}

const IMAGE_RETRY_MS = 2000;
const IMAGE_MAX_RETRIES = 5;
const IMAGE_URL_REFRESH_MIN_MS = 30_000;

/**
 * รูปที่ลูกค้าส่ง (messageType IMAGE):
 * - mediaUrl = null คือรูปยังไม่พร้อม โหลดข้อความซ้ำทุก 2 วินาที สูงสุด 5 ครั้ง แล้วถือว่าแสดงรูปไม่ได้
 * - mediaUrl เป็น signed URL อายุ 15 นาที โหลดรูปไม่ขึ้น (onError) ให้ refetch เพื่อรับ URL ใหม่
 *   (จำกัดไม่เกินครั้งละ 30 วินาที กันวนซ้ำเมื่อรูปเสียจริง)
 */
export function useImageMediaRefresh(
  messages: LineChatHistory[],
  refetch: () => unknown,
  conversationId?: string
) {
  const attemptsRef = useRef(new Map<string, number>());
  const lastUrlRefreshRef = useRef(0);
  const [tick, setTick] = useState(0);

  // ห้องใหม่เริ่มนับใหม่
  useEffect(() => {
    attemptsRef.current = new Map();
  }, [conversationId]);

  const waitingIds = messages
    .filter(
      (message) =>
        message.messageType.toUpperCase() === "IMAGE" &&
        !message.mediaUrl &&
        (attemptsRef.current.get(message.id) ?? 0) < IMAGE_MAX_RETRIES
    )
    .map((message) => message.id);
  const waitingKey = waitingIds.join(",");

  useEffect(() => {
    if (!waitingKey) return;
    const timer = window.setTimeout(() => {
      for (const id of waitingKey.split(",")) {
        attemptsRef.current.set(id, (attemptsRef.current.get(id) ?? 0) + 1);
      }
      setTick((value) => value + 1);
      void refetch();
    }, IMAGE_RETRY_MS);
    return () => window.clearTimeout(timer);
    // tick: ให้ effect ตั้งเวลาใหม่หลังแต่ละรอบ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingKey, tick]);

  const onImageError = useCallback(() => {
    const now = Date.now();
    if (now - lastUrlRefreshRef.current < IMAGE_URL_REFRESH_MIN_MS) return;
    lastUrlRefreshRef.current = now;
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isImageLoading: (id: string) => waitingKey.split(",").includes(id), onImageError };
}

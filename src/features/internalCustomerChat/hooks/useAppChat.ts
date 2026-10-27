import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import { appChatApi } from "../services/appChat.service";
import type { AppHistoryMessage, FailedAppSend, StoredAppGuest } from "../type";

const POLL_INTERVAL_MS = 2500;
const PAGE_SIZE = 30;
const GUEST_KEY = "internal-customer-chat:app-guest";
const GUEST_DISPLAY_NAME = "Dashboard test";

export const appChatKeys = {
  conversations: ["app-chat", "conversations"] as const,
  messages: (conversationId?: string) => ["app-chat", "messages", conversationId] as const,
  guest: (token?: string) => ["app-chat", "guest", token] as const,
};

type MessagePages = InfiniteData<AppHistoryMessage[], string | undefined>;

const statusOf = (error: unknown) => (axios.isAxiosError(error) ? error.response?.status : undefined);

const newId = () => crypto.randomUUID();

const readGuest = (): StoredAppGuest | undefined => {
  try {
    const raw = sessionStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as StoredAppGuest) : undefined;
  } catch {
    return undefined;
  }
};

const storeGuest = (guest?: StoredAppGuest) => {
  try {
    if (guest) sessionStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    else sessionStorage.removeItem(GUEST_KEY);
  } catch {
    // sessionStorage ถูกบล็อก ก็แค่ refresh แล้วได้ลูกค้าจำลองคนใหม่
  }
};

/** ห้องแชท App ของบริษัท (waiting_admin ขึ้นก่อน เรียงจาก backend แล้ว) */
export function useAppConversations(enabled: boolean) {
  return useQuery({
    queryKey: appChatKeys.conversations,
    queryFn: appChatApi.getConversations,
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL_MS : false,
  });
}

/** ประวัติของห้องที่เลือก: โหลดหน้าล่าสุดก่อน แล้วโหลดย้อนหลังด้วย before */
export function useAppMessages(conversationId: string | undefined, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: appChatKeys.messages(conversationId),
    enabled: enabled && Boolean(conversationId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      appChatApi.getMessages({
        conversationId: conversationId ?? "",
        before: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.length < PAGE_SIZE ? undefined : lastPage[0]?.createdAt,
  });
}

/** ดึงเฉพาะข้อความใหม่ (after) ต่อท้ายหน้าล่าสุด ไม่ต้องโหลดทั้งห้องซ้ำ */
export function usePollAppMessages(conversationId: string | undefined, enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !conversationId) return;

    const queryKey = appChatKeys.messages(conversationId);

    const poll = async () => {
      const current = queryClient.getQueryData<MessagePages>(queryKey);
      if (!current) return;

      const latest = current.pages
        .flat()
        .reduce<AppHistoryMessage | undefined>(
          (acc, message) =>
            !acc || new Date(message.createdAt) > new Date(acc.createdAt) ? message : acc,
          undefined
        );

      // ห้องที่ยังไม่มีข้อความ ไม่มีจุดอ้างอิงสำหรับ after จึงโหลดใหม่ทั้งหน้า
      if (!latest) {
        void queryClient.invalidateQueries({ queryKey });
        return;
      }

      const fresh = await appChatApi.getMessages({
        conversationId,
        after: latest.createdAt,
        limit: 100,
      });
      if (fresh.length === 0) return;

      queryClient.setQueryData<MessagePages>(queryKey, (data) => {
        if (!data?.pages.length) return data;
        const known = new Set(data.pages.flat().map((message) => message.id));
        const unique = fresh.filter((message) => !known.has(message.id));
        if (unique.length === 0) return data;
        return {
          ...data,
          pages: data.pages.map((page, index) => (index === 0 ? [...page, ...unique] : page)),
        };
      });
      void queryClient.invalidateQueries({ queryKey: appChatKeys.conversations });
    };

    const id = window.setInterval(() => void poll().catch(() => undefined), POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [conversationId, enabled, queryClient]);
}

/** แอดมินตอบในห้อง: ส่งซ้ำด้วย clientRequestId เดิมจะไม่เกิดข้อความซ้ำ */
export function useSendAppAdminMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) =>
      appChatApi.sendAdminMessage({
        conversationId: conversationId ?? "",
        text,
        clientRequestId: newId(),
      }),
    onSuccess: (message) => {
      queryClient.setQueryData<MessagePages>(appChatKeys.messages(conversationId), (data) => {
        if (!data?.pages.length) return data;
        if (data.pages.flat().some((item) => item.id === message.id)) return data;
        return {
          ...data,
          pages: data.pages.map((page, index) => (index === 0 ? [...page, message] : page)),
        };
      });
      void queryClient.invalidateQueries({ queryKey: appChatKeys.conversations });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("chat:appChat.adminSendError")));
    },
  });
}

export function useAppBotMode(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const onSettled = () => {
    void queryClient.invalidateQueries({ queryKey: appChatKeys.conversations });
    void queryClient.invalidateQueries({ queryKey: ["app-chat", "guest"] });
  };
  const onError = (error: unknown) =>
    toast.error(getApiErrorMessage(error, i18n.t("chat:appChat.botActionError")));

  const pause = useMutation({
    mutationFn: () => appChatApi.pauseBot(conversationId ?? ""),
    onSuccess: () => toast.success(i18n.t("chat:appChat.botPaused")),
    onError,
    onSettled,
  });

  const resume = useMutation({
    mutationFn: () => appChatApi.resumeBot(conversationId ?? ""),
    onSuccess: () => toast.success(i18n.t("chat:appChat.botResumed")),
    onError,
    onSettled,
  });

  return { pause, resume };
}

/**
 * ลูกค้าจำลอง (guest) ของแท็บนี้ ใช้ App Message API จริงเหมือนแอปลูกค้า
 * - token เก็บใน sessionStorage (backend แสดงครั้งเดียว) ปิดแท็บแล้วได้ลูกค้าใหม่
 * - ส่งทีละข้อความ; ล้มเหลวแบบ network/5xx เก็บ clientMessageId ไว้ retry โดยไม่ตัดเครดิตซ้ำ
 */
export function useAppGuest(active: boolean) {
  const queryClient = useQueryClient();
  const [stored, setStored] = useState(readGuest);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [failedSend, setFailedSend] = useState<FailedAppSend>();
  const busyRef = useRef(false);

  const info = useQuery({
    queryKey: appChatKeys.guest(stored?.token),
    enabled: active && Boolean(stored),
    queryFn: () => appChatApi.describeGuest(stored?.token ?? ""),
    retry: false,
    refetchInterval: active ? 10_000 : false,
  });

  const forget = useCallback(() => {
    storeGuest(undefined);
    setStored(undefined);
  }, []);

  // session หมดอายุ/ถูกเพิกถอน: ลืม token แล้วข้อความถัดไปจะสร้างลูกค้าใหม่
  const infoStatus = statusOf(info.error);
  useEffect(() => {
    if (infoStatus === 401) forget();
  }, [infoStatus, forget]);

  const send = async (text: string, retry?: FailedAppSend) => {
    const value = text.trim();
    if (!value || busyRef.current) return undefined;

    const clientMessageId = retry?.clientMessageId ?? newId();
    busyRef.current = true;
    setIsSending(true);
    setError("");
    setFailedSend(undefined);

    try {
      let guest = stored;
      if (!guest) {
        const created = await appChatApi.createGuestSession(GUEST_DISPLAY_NAME);
        guest = { token: created.sessionToken, guestId: created.guestId };
        storeGuest(guest);
        setStored(guest);
      }

      await appChatApi.sendGuestMessage(guest.token, { clientMessageId, text: value });

      // ห้องถูกสร้างตอนส่งข้อความแรก จึงถามหา conversationId หลังส่ง
      const described = await appChatApi.describeGuest(guest.token);
      queryClient.setQueryData(appChatKeys.guest(guest.token), described);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: appChatKeys.conversations }),
        described.conversationId
          ? queryClient.invalidateQueries({
              queryKey: appChatKeys.messages(described.conversationId),
            })
          : undefined,
      ]);
      return described.conversationId ?? undefined;
    } catch (failure) {
      const status = statusOf(failure);
      if (status === 401) forget();
      // 4xx ส่งซ้ำก็ไม่หาย เก็บไว้ retry เฉพาะ network/5xx
      else if (!status || status >= 500) setFailedSend({ clientMessageId, text: value });
      setError(getApiErrorMessage(failure, i18n.t("chat:appChat.sendError")));
      return undefined;
    } finally {
      busyRef.current = false;
      setIsSending(false);
    }
  };

  /** ลูกค้าจำลองคนใหม่: เพิกถอน session เดิม (ห้องเดิมยังอยู่ในรายการจนครบ retention) */
  const restart = async () => {
    if (busyRef.current) return;
    const previous = stored;
    forget();
    setError("");
    setFailedSend(undefined);
    if (previous) await appChatApi.revokeGuest(previous.token).catch(() => undefined);
  };

  return {
    guestId: stored?.guestId,
    conversationId: info.data?.conversationId ?? undefined,
    botMode: info.data?.botMode,
    isSending,
    error,
    failedSend,
    send,
    restart,
  };
}

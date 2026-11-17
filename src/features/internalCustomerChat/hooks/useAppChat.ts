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
const ROOM_PAGE_SIZE = 20;
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

const MAX_GUESTS = 30;

const readGuests = (): StoredAppGuest[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as StoredAppGuest[]) : [];
  } catch {
    return [];
  }
};

const writeGuests = (guests: StoredAppGuest[]) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(guests.slice(-MAX_GUESTS)));
  } catch {
    // localStorage ถูกบล็อก ก็แค่ refresh แล้วได้ลูกค้าจำลองคนใหม่
  }
};

/** ห้องแชท App ของบริษัท (waiting_admin ขึ้นก่อน เรียงจาก backend แล้ว) */
export function useAppConversations(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: appChatKeys.conversations,
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      appChatApi.getConversations({ limit: ROOM_PAGE_SIZE, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // poll จะดึงทุกหน้าที่โหลดไว้ใหม่ตามลำดับ รายการจึงไม่ค้างเก่า
    refetchInterval: enabled ? POLL_INTERVAL_MS : false,
    // ห้องที่ขยับขึ้นมาระหว่างโหลดหน้าถัดไปอาจซ้ำข้ามหน้า จึงตัดซ้ำตาม id
    select: (data) => {
      const seen = new Set<string>();
      const rooms = data.pages
        .flatMap((page) => page.items)
        .filter((room) => (seen.has(room.id) ? false : (seen.add(room.id), true)));
      return { rooms, pageCount: data.pages.length };
    },
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

/** เคลียร์ unreadCount ของห้องที่แอดมินเปิดอยู่ หลังโหลดข้อความแล้ว และเมื่อมีข้อความใหม่เข้ามาขณะเปิดค้างไว้ */
export function useMarkAppConversationRead(
  conversationId: string | undefined,
  unreadCount: number | undefined,
  ready: boolean
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

    appChatApi
      .markRead(conversationId)
      .then(() => queryClient.invalidateQueries({ queryKey: appChatKeys.conversations }))
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
  }, [conversationId, unreadCount, ready, queryClient, retryTick]);
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
 * ลูกค้าจำลอง (guest) ใช้ App Message API จริงเหมือนแอปลูกค้า
 * - token ของ guest ทุกห้องเก็บใน localStorage (backend แสดง token ครั้งเดียว) เลือกห้องไหนก็สลับไปใช้ token ของห้องนั้น
 *   ห้องที่สร้างก่อนมีระบบนี้ไม่มี token เหลือ จึงส่งในนามลูกค้าไม่ได้
 * - ส่งทีละข้อความ; ล้มเหลวแบบ network/5xx เก็บ clientMessageId ไว้ retry โดยไม่ตัดเครดิตซ้ำ
 */
export function useAppGuest(active: boolean) {
  const queryClient = useQueryClient();
  const [guests, setGuests] = useState(readGuests);
  const [currentToken, setCurrentToken] = useState<string | undefined>(() => readGuests().at(-1)?.token);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [failedSend, setFailedSend] = useState<FailedAppSend>();
  const busyRef = useRef(false);

  const stored = guests.find((guest) => guest.token === currentToken);

  const updateGuests = useCallback((update: (list: StoredAppGuest[]) => StoredAppGuest[]) => {
    setGuests((previous) => {
      const next = update(previous);
      writeGuests(next);
      return next;
    });
  }, []);

  const info = useQuery({
    queryKey: appChatKeys.guest(stored?.token),
    enabled: active && Boolean(stored),
    queryFn: () => appChatApi.describeGuest(stored?.token ?? ""),
    retry: false,
    refetchInterval: active ? 10_000 : false,
  });

  // จำว่า token นี้เป็นเจ้าของห้องไหน เพื่อสลับกลับมาตอนเลือกห้อง
  const knownConversationId = info.data?.conversationId ?? undefined;
  useEffect(() => {
    if (!stored || !knownConversationId || stored.conversationId === knownConversationId) return;
    updateGuests((list) =>
      list.map((guest) =>
        guest.token === stored.token ? { ...guest, conversationId: knownConversationId } : guest
      )
    );
  }, [stored, knownConversationId, updateGuests]);

  const forget = useCallback(
    (token?: string) => {
      if (!token) return;
      updateGuests((list) => list.filter((guest) => guest.token !== token));
      setCurrentToken((current) => (current === token ? undefined : current));
    },
    [updateGuests]
  );

  // session หมดอายุ/ถูกเพิกถอน: ลืม token นั้น ห้องกลับไปตอบได้เฉพาะในนามแอดมิน
  const infoStatus = statusOf(info.error);
  useEffect(() => {
    if (infoStatus === 401) forget(stored?.token);
  }, [infoStatus, forget, stored?.token]);

  /** เลือกห้อง: ถ้ามี token ของห้องนั้นให้สลับไปใช้ คืนค่า true */
  const select = (conversationId: string | null) => {
    const owner = conversationId ? guests.find((guest) => guest.conversationId === conversationId) : undefined;
    setCurrentToken(owner?.token);
    setError("");
    setFailedSend(undefined);
    return Boolean(owner);
  };

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
        const created_guest = guest;
        updateGuests((list) => [...list, created_guest]);
        setCurrentToken(guest.token);
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
      if (status === 401) forget(stored?.token);
      // 4xx ส่งซ้ำก็ไม่หาย เก็บไว้ retry เฉพาะ network/5xx
      else if (!status || status >= 500) setFailedSend({ clientMessageId, text: value });
      setError(getApiErrorMessage(failure, i18n.t("chat:appChat.sendError")));
      return undefined;
    } finally {
      busyRef.current = false;
      setIsSending(false);
    }
  };

  /** ลูกค้าจำลองคนใหม่: ไม่เพิกถอน session เดิม เพื่อให้กลับมาส่งในนามลูกค้าของห้องเดิมได้ */
  const restart = () => {
    if (busyRef.current) return;
    setCurrentToken(undefined);
    setError("");
    setFailedSend(undefined);
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
    select,
  };
}

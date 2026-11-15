import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { getIntlLocale } from "@/i18n/format";
import { useEffect, useMemo, useRef, useState } from "react";
import { UserAvatar } from "@/features/user/components/UserVisuals";
import { useSearchParams } from "react-router-dom";
import { ArrowUp, ChevronDown, ChevronLeft, Ellipsis, ImageIcon, LayoutGrid, PencilLine, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchIcon, SidebarToggleIcon } from "@/components/navbar/icons";
import { BotModeSelect } from "./components/BotModeSelect";
import { CustomerPanel } from "./components/CustomerPanel";
import {
  ApplicationIcon,
  LineIcon,
  LineSquareIcon,
  MessengerIcon,
  MessengerSoonIcon,
  TikTokIcon,
  TikTokSoonIcon,
} from "./components/ChannelIcons";
import { Textarea } from "@/components/ui/textarea";
import {
  useConversationMessages,
  useConversations,
  usePollConversationMessages,
  useSendLineMessage,
} from "./hooks/useLineChat";
import {
  useMarkConversationNotificationsAsRead,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import type {
  ConversationPlatform,
  LineChatHistory,
  LineChatMessageType,
  LineChatSender,
} from "./types/lineChat.type";

const formatTime = (date?: string | null) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat(getIntlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

/** เริ่มโหลดข้อความเก่าก่อนถึงบนสุดของรายการ เพื่อให้เลื่อนขึ้นไปแล้วไม่ต้องรอ */
const MESSAGE_PREFETCH_OFFSET_PX = 80;

const normalizeSender = (sender: LineChatSender) => sender.toUpperCase();
const normalizeType = (type: LineChatMessageType) => type.toUpperCase();

function getMessagePreview(message: string, type: LineChatMessageType) {
  const messageType = normalizeType(type);
  if (messageType === "IMAGE") return i18n.t("chat:line.preview.image");
  if (messageType === "STICKER") return i18n.t("chat:line.preview.sticker");
  if (messageType === "POSTBACK") return i18n.t("chat:line.preview.postback");
  return message || "-";
}

function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "header";
}) {
  const sizeClass = {
    xs: "size-7 text-xs",
    sm: "size-8 text-xs",
    header: "size-9 text-sm",
    md: "size-10 text-sm",
    lg: "size-11 text-sm",
  }[size];

  // ไม่มีรูป หรือรูปโหลดไม่ได้ (ลิงก์หมดอายุ) แสดงอักษรแรกของชื่อบนพื้นสีเหมือนหน้าผู้ใช้
  return <UserAvatar name={name} src={src ?? undefined} className={sizeClass} />;
}

const PLATFORM_ICONS: Record<ConversationPlatform, React.ElementType> = {
  line: LineIcon,
  messenger: MessengerIcon,
  tiktok: TikTokIcon,
  application: ApplicationIcon,
};

/** จุดช่องทางที่มุมล่างขวาของรูปโปรไฟล์ (วงกลม 14px ขอบขาว) */
function PlatformBadge({ platform = "line" }: { platform?: ConversationPlatform }) {
  const Icon = PLATFORM_ICONS[platform] ?? LineIcon;

  return (
    <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-background ring-2 ring-background">
      <Icon className="size-3.5" />
    </span>
  );
}

const GeminiSparkle = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" fill="#4285f4" />
  </svg>
);

function MessageContent({ message }: { message: LineChatHistory }) {
  const { t } = useTranslation("chat");
  const type = normalizeType(message.messageType);

  if (type === "IMAGE") {
    return message.mediaUrl ? (
      <img
        src={message.mediaUrl}
        alt={t("line.message.imageAlt")}
        className="max-h-72 rounded-xl object-cover"
      />
    ) : (
      <div className="flex items-center gap-2 text-sm">
        <ImageIcon className="h-4 w-4" />
        {t("line.message.imageUnavailable")}
      </div>
    );
  }

  if (type === "STICKER") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Smile className="h-4 w-4" />
        {t("line.message.sticker", {
          packageId: message.stickerPackageId ?? "-",
          stickerId: message.stickerId ?? "-",
        })}
      </div>
    );
  }

  if (type === "POSTBACK") {
    return (
      <div className="rounded-xl bg-background/60 px-3 py-2 text-xs font-medium text-mini">
        {message.postbackData ?? t("line.message.postback")}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap leading-relaxed text-inherit">{message.text ?? "-"}</p>;
}

const INITIAL_VISIBLE_CONVERSATIONS = 12;
const LOAD_MORE_CONVERSATIONS = 10;

type ChannelId = "all" | "line" | "messenger" | "tiktok";
type QuickFilterId = "all" | "unread" | "waiting";

/** สถานะที่บอทส่งต่อมาให้แอดมินตอบเอง — ต้องมีคนลงมือ จึงต้องเด่นกว่าแชทอื่น */
const WAITING_ADMIN = "waiting_admin";

const QUICK_FILTERS: { id: QuickFilterId; labelKey: string; soon?: boolean }[] = [
  { id: "all", labelKey: "line.quickFilter.all" },
  { id: "unread", labelKey: "line.quickFilter.unread" },
  { id: "waiting", labelKey: "line.quickFilter.waiting" },
];

/** ชิปช่องทาง: ตัวที่เลือกพื้นดำ ช่องที่ยังไม่เปิดใช้เป็นไอคอนจาง ๆ */
function ChannelChips({
  value,
  counts,
  onChange,
}: {
  value: ChannelId;
  counts: Record<"all" | "line", number>;
  onChange: (id: ChannelId) => void;
}) {
  const { t } = useTranslation("chat");
  const pill = (id: "all" | "line") => {
    const isActive = id === value;

    return (
      <button
        key={id}
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={() => onChange(id)}
        className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full pl-1 pr-2.5 text-xs font-medium transition-colors ${
          isActive ? "bg-primary text-primary-foreground" : "border bg-background text-foreground hover:bg-accent"
        }`}
      >
        {id === "all" ? (
          <span className="flex size-[22px] items-center justify-center rounded-full bg-white/20">
            <LayoutGrid className="size-[11px]" />
          </span>
        ) : (
          <LineSquareIcon className="size-[22px]" />
        )}
        {t(`line.channel.${id}`)}
        <span className={isActive ? "text-primary-foreground/70" : "text-muted-foreground"}>{counts[id]}</span>
      </button>
    );
  };

  return (
    <div role="radiogroup" className="flex items-center gap-1.5 overflow-x-auto">
      {pill("all")}
      {pill("line")}
      <span
        title={`${t("line.channel.messenger")} · ${t("line.comingSoon")}`}
        className="ml-2.5 shrink-0"
      >
        <MessengerSoonIcon className="size-5" />
      </span>
      <span title={`${t("line.channel.tiktok")} · ${t("line.comingSoon")}`} className="ml-1 shrink-0">
        <TikTokSoonIcon className="size-5" />
      </span>
    </div>
  );
}

/** ตัวกรองด่วนแบบแท็บขีดเส้นใต้ ตัวที่เลือกขีดดำ */
function QuickFilterTabs({
  value,
  waitingCount,
  onChange,
}: {
  value: QuickFilterId;
  waitingCount: number;
  onChange: (id: QuickFilterId) => void;
}) {
  const { t } = useTranslation("chat");

  return (
    <div role="tablist" className="flex gap-6 border-b px-5">
      {QUICK_FILTERS.map((item) => {
        const isActive = item.id === value;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`-mb-px flex h-10 cursor-pointer items-center gap-2 border-b-2 text-[13px] transition-colors ${
              isActive
                ? "border-primary font-semibold text-primary"
                : "border-transparent font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(item.labelKey)}
            {/* จำนวนที่รอแอดมินโชว์เฉพาะเมื่อมี เพื่อให้เห็นภาระงานโดยไม่ต้องกดเข้าไป */}
            {item.id === "waiting" && waitingCount > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-600 px-1.5 text-[11px] font-semibold text-white">
                {waitingCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** ป้ายสถานะ: waiting_admin เป็นสีส้มพร้อมจุด สถานะอื่นเป็นป้ายเทากลาง ๆ */
function ConversationStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("chat");

  if (status !== WAITING_ADMIN) {
    return (
      <span className="shrink-0 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-normal">
        {t(`line.status.${status}`, { defaultValue: status })}
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
      <span className="size-1.5 rounded-full bg-orange-600" />
      {t("line.status.waiting_admin")}
    </span>
  );
}

export const LineChat = () => {
  const { t } = useTranslation("chat");
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  // ไม่มีปุ่มพับแถบรายการแล้ว (ตามดีไซน์ Inbox) แต่คงโครงสร้างโหมดพับไว้เผื่อกลับมาใช้
  const isInboxOpen = true;
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  // จอแคบ (< xl) แสดงทีละฝั่ง: รายการแชท หรือห้องแชท เปิดห้องจากแจ้งเตือนให้เข้าห้องเลย
  const [isChatOpenOnMobile, setIsChatOpenOnMobile] = useState(() =>
    Boolean(searchParams.get("conversationId"))
  );
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<ChannelId>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilterId>("all");
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CONVERSATIONS);
  const messageListRef = useRef<HTMLDivElement>(null);
  const preservingScrollRef = useRef(false);

  const conversationsQuery = useConversations();
  // ห่อด้วย useMemo ไม่งั้น `?? []` สร้าง array ใหม่ทุก render แล้ว useMemo ที่อ้างถึงคำนวณซ้ำทุกครั้ง
  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);

  const notificationsQuery = useNotifications();
  const markConversationNotificationsAsRead =
    useMarkConversationNotificationsAsRead();

  const unreadNotificationConversationIds = useMemo(() => {
    const ids = new Set<string>();
    (notificationsQuery.data ?? []).forEach((notification) => {
      const conversationId = notification.metadata?.conversationId;
      if (!notification.isRead && conversationId) {
        ids.add(conversationId);
      }
    });
    return ids;
  }, [notificationsQuery.data]);

  const readNotificationConversationIds = useMemo(() => {
    const ids = new Set<string>();
    (notificationsQuery.data ?? []).forEach((notification) => {
      const conversationId = notification.metadata?.conversationId;
      if (notification.isRead && conversationId) {
        ids.add(conversationId);
      }
    });
    return ids;
  }, [notificationsQuery.data]);

  const sortedConversations = useMemo(() => {
    const direction = isNewestFirst ? 1 : -1;

    // backend เรียง waiting_admin ไว้บนสุดอยู่แล้ว ถ้าเรียงตามเวลาอย่างเดียวจะทำลายลำดับนั้น
    // จึงแยกกลุ่มก่อน แล้วปุ่มสลับใหม่/เก่าสุดมีผลเฉพาะภายในแต่ละกลุ่ม
    const priority = (status: string) => (status === WAITING_ADMIN ? 0 : 1);

    return [...conversations].sort(
      (a, b) =>
        priority(a.status) - priority(b.status) ||
        direction *
          (new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    );
  }, [conversations, isNewestFirst]);

  const waitingCount = useMemo(
    () => conversations.filter((conversation) => conversation.status === WAITING_ADMIN).length,
    [conversations]
  );

  const channelCounts = useMemo(
    () => ({
      all: conversations.length,
      line: conversations.filter((conversation) => (conversation.platform ?? "line") === "line").length,
    }),
    [conversations]
  );

  // ตัวเลขในแถบ "กำลังดู" นับเฉพาะช่องทางที่เลือก
  const channelConversations = useMemo(
    () =>
      channel === "all"
        ? conversations
        : conversations.filter((conversation) => (conversation.platform ?? "line") === channel),
    [channel, conversations]
  );
  const channelWaitingCount = useMemo(
    () => channelConversations.filter((conversation) => conversation.status === WAITING_ADMIN).length,
    [channelConversations]
  );
  const viewingLabel = channel === "all" ? t("line.allChannels") : t(`line.channel.${channel}`);

  const filteredConversations = useMemo(() => {
    const byChannel =
      channel === "all"
        ? sortedConversations
        : sortedConversations.filter(
            (conversation) => (conversation.platform ?? "line") === channel
          );
    const byQuickFilter =
      quickFilter === "unread"
        ? byChannel.filter((conversation) => conversation.unreadCount > 0)
        : quickFilter === "waiting"
          ? byChannel.filter((conversation) => conversation.status === WAITING_ADMIN)
          : byChannel;

    const keyword = search.trim().toLowerCase();
    if (!keyword) return byQuickFilter;

    return byQuickFilter.filter((conversation) =>
      [
        conversation.lineMember?.displayName,
        conversation.lineMember?.lineUserId,
        conversation.lastMessage,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [channel, quickFilter, search, sortedConversations]);

  const visibleConversations = filteredConversations.slice(0, visibleCount);
  const hasMoreConversations = visibleCount < filteredConversations.length;

  // a narrowed list should start from the top again
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_CONVERSATIONS);
  }, [channel, quickFilter, search]);

  // keep the open conversation reachable even when it sits past the cut-off
  useEffect(() => {
    if (!selectedId) return;

    const index = filteredConversations.findIndex(
      (conversation) => conversation.id === selectedId
    );

    if (index >= visibleCount) setVisibleCount(index + 1);
  }, [filteredConversations, selectedId, visibleCount]);

  useEffect(() => {
    if (selectedId) return;

    const fromNotification = searchParams.get("conversationId");
    if (fromNotification) {
      setSelectedId(fromNotification);
      return;
    }

    if (sortedConversations[0]) {
      setSelectedId(sortedConversations[0].id);
    }
  }, [selectedId, sortedConversations, searchParams]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    sortedConversations[0];

  // Opening a conversation clears any unread notification tied to it.
  useEffect(() => {
    if (
      selectedConversation?.id &&
      unreadNotificationConversationIds.has(selectedConversation.id)
    ) {
      markConversationNotificationsAsRead.mutate(selectedConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);

  const messagesQuery = useConversationMessages(selectedConversation?.id);
  const sendMessageMutation = useSendLineMessage(selectedConversation?.id);
  usePollConversationMessages(selectedConversation?.id);

  const messages = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? [];
    return [...pages].reverse().flat();
  }, [messagesQuery.data]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container || preservingScrollRef.current || messages.length === 0) return;
    container.scrollTop = container.scrollHeight;
  }, [selectedConversation?.id, messages.length, messagesQuery.isSuccess]);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setIsChatOpenOnMobile(true);
  };

  const handleMessagesScroll = async () => {
    const container = messageListRef.current;
    if (
      !container ||
      container.scrollTop > MESSAGE_PREFETCH_OFFSET_PX ||
      !messagesQuery.hasNextPage ||
      messagesQuery.isFetchingNextPage
    ) {
      return;
    }

    preservingScrollRef.current = true;
    const previousHeight = container.scrollHeight;
    await messagesQuery.fetchNextPage();

    requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop =
          messageListRef.current.scrollHeight - previousHeight;
      }
      preservingScrollRef.current = false;
    });
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !selectedConversation || sendMessageMutation.isPending) return;

    await sendMessageMutation.mutateAsync(text);
    setReply("");

    requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    });
  };

  const handleReplyKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendReply();
    }
  };

  const showInfoPanel = isInfoOpen && !!selectedConversation;

  const selectedName = selectedConversation?.lineMember?.displayName ?? t("line.defaultUser");

  const conversationHeader = (
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2">
      {selectedConversation ? (
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("line.back")}
            className="size-8 shrink-0 cursor-pointer rounded-full xl:hidden"
            onClick={() => setIsChatOpenOnMobile(false)}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Avatar name={selectedName} src={selectedConversation.lineMember?.pictureUrl} size="header" />
          <div className="flex min-w-0 flex-col leading-snug">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-foreground">{selectedName}</span>
              <ConversationStatusBadge status={selectedConversation.status} />
            </div>
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <span>{t(`line.channel.${selectedConversation.platform ?? "line"}`, { defaultValue: "LINE" })}</span>
              <span>·</span>
              <span
                title={selectedConversation.lineMember?.lineUserId}
                className="max-w-[16ch] truncate font-mono"
              >
                {selectedConversation.lineMember?.lineUserId ?? "-"}
              </span>
              {selectedConversation.lineMember?.lastActiveAt && (
                <span className="hidden truncate md:inline">
                  · {t("line.lastActive", { time: formatTime(selectedConversation.lineMember.lastActiveAt) })}
                </span>
              )}
            </span>
          </div>
        </div>
      ) : (
        <p className="font-semibold text-foreground">{t("line.selectConversation")}</p>
      )}
      <div className="flex shrink-0 items-center gap-2">
        {selectedConversation && (
          <>
            <BotModeSelect conversation={selectedConversation} />
            <Button
              variant="outline"
              size="icon"
              aria-label={t("line.customerInfo")}
              aria-pressed={isInfoOpen}
              className={`size-[38px] cursor-pointer rounded-[10px] text-foreground shadow-none max-xl:hidden ${isInfoOpen ? "bg-muted" : ""}`}
              onClick={() => setIsInfoOpen((value) => !value)}
            >
              <SidebarToggleIcon className="size-4 rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("line.settings")}
              className="size-[38px] rounded-[10px] text-foreground shadow-none"
            >
              <Ellipsis className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="-mx-4 h-[calc(100svh-62px)] overflow-hidden md:-mx-6">
      <div
        className={`grid h-full w-full grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-background xl:grid-rows-none ${
          isInboxOpen
            ? showInfoPanel
              ? "xl:grid-cols-[380px_minmax(0,1fr)_320px]"
              : "xl:grid-cols-[380px_minmax(0,1fr)]"
            : showInfoPanel
              ? "xl:grid-cols-[76px_minmax(0,1fr)_320px]"
              : "xl:grid-cols-[76px_minmax(0,1fr)]"
        }`}
      >
        <aside
          className={`min-h-0 min-w-0 flex-col border-b bg-background xl:flex xl:border-b-0 xl:border-r ${
            isChatOpenOnMobile ? "hidden" : "flex"
          }`}
        >
          <div className={`flex shrink-0 items-center gap-3 ${isInboxOpen ? "px-5 pb-3 pt-4" : "justify-center py-4"}`}>
            {isInboxOpen && (
              <>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-base font-semibold leading-tight text-foreground">{t("line.inbox")}</h1>
                  <p className="truncate text-xs text-muted-foreground">{t("line.inboxSubtitle")}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t("line.newChat")}
                  className="size-9 shrink-0 rounded-xl shadow-none"
                >
                  <PencilLine className="size-4" />
                </Button>
              </>
            )}
          </div>

          {isInboxOpen && (
            <>
              <div className="shrink-0 px-5 pb-3">
                <ChannelChips value={channel} counts={channelCounts} onChange={setChannel} />
              </div>

              <div className="shrink-0 px-5 pb-3">
                <div className="flex h-9 items-center gap-2 rounded-xl border bg-muted/40 px-3 text-xs">
                  <span className="text-muted-foreground">{t("line.viewing")}</span>
                  <span className="size-2 shrink-0 rounded-full bg-primary" />
                  <span className="truncate font-semibold text-foreground">{viewingLabel}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">
                    {t("line.conversationCount", { count: channelConversations.length })} ·{" "}
                    {t("line.waitingCount", { count: channelWaitingCount })}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2 border-t px-5 pb-3 pt-3">
                <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted px-3">
                  <SearchIcon className="size-[15px] shrink-0 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label={t("line.searchPlaceholder")}
                    className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder={t("line.searchPlaceholder")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewestFirst((value) => !value)}
                  title={isNewestFirst ? t("line.newestFirst") : t("line.oldestFirst")}
                  aria-label={isNewestFirst ? t("line.newestFirst") : t("line.oldestFirst")}
                  className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors hover:bg-accent ${
                    isNewestFirst ? "bg-background text-normal" : "bg-muted text-foreground"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                </button>
              </div>

              <QuickFilterTabs value={quickFilter} waitingCount={waitingCount} onChange={setQuickFilter} />
            </>
          )}

          <div className={`min-h-0 flex-1 overflow-y-auto pb-2 ${isInboxOpen ? "px-2" : "px-1.5 pt-2"}`}>
            {conversationsQuery.isLoading && (
              <div className="px-3 py-3 text-xs text-muted-foreground">{t("line.loading")}</div>
            )}

            {conversationsQuery.isError && (
              <div className="px-3 py-3 text-xs text-destructive">{t("line.error")}</div>
            )}

            {!conversationsQuery.isLoading && filteredConversations.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">{t("line.empty")}</div>
            )}

            {visibleConversations.map((conversation) => {
              const isActive = conversation.id === selectedConversation?.id;
              const displayName = conversation.lineMember?.displayName ?? t("line.defaultUser");
              const preview = getMessagePreview(conversation.lastMessage, conversation.lastMessageType);
              const hasUnreadNotification = unreadNotificationConversationIds.has(
                conversation.id
              );
              const hasReadNotification = readNotificationConversationIds.has(
                conversation.id
              );
              const isWaitingAdmin = conversation.status === WAITING_ADMIN;
              const rowBg = isActive
                ? "bg-muted"
                : hasUnreadNotification
                  ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
                  : hasReadNotification
                    ? "opacity-70 hover:bg-accent/60"
                    : "hover:bg-accent/60";

              return (
                <button
                  key={conversation.id}
                  type="button"
                  aria-current={isActive}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`relative flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition-colors ${rowBg} ${
                    isInboxOpen ? "" : "justify-center"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      name={displayName}
                      src={conversation.lineMember?.pictureUrl}
                      size="sm"
                    />
                    {!isInboxOpen && conversation.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-4 text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                    {isInboxOpen && <PlatformBadge platform={conversation.platform} />}
                  </div>
                  {isInboxOpen && (
                    <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`truncate text-sm text-foreground ${
                            conversation.unreadCount > 0 ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {displayName}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isWaitingAdmin && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-[7px] py-px text-[11px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                            <span className="size-[5px] rounded-full bg-orange-600" />
                            {t("line.status.waiting_admin_short")}
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-[13px] text-normal">{preview}</span>
                        {conversation.unreadCount > 0 && (
                          <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-[5px] text-[11px] font-semibold text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {hasMoreConversations && (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) => count + LOAD_MORE_CONVERSATIONS)
                }
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-medium text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
              >
                {isInboxOpen ? t("line.showMore") : ""}
                <ChevronDown className="size-3.5" />
              </button>
            )}

            {isInboxOpen && !hasMoreConversations && filteredConversations.length > 0 && (
              <p className="pb-6 pt-4 text-center text-xs text-muted-foreground">
                {t("line.conversationCount", { count: filteredConversations.length })}
              </p>
            )}
          </div>
        </aside>

        <main
          className={`min-h-0 min-w-0 w-full flex-col bg-background xl:flex ${
            isChatOpenOnMobile ? "flex" : "hidden"
          }`}
        >
          <header className="flex min-h-16 shrink-0 items-center border-b px-4 py-2.5 sm:px-6">
            {conversationHeader}
          </header>

          <div
            ref={messageListRef}
            onScroll={handleMessagesScroll}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div className="mx-auto flex w-full max-w-[880px] flex-col px-4 pb-6 pt-7 sm:px-6">
              {messagesQuery.isFetchingNextPage && (
                <div className="mx-auto mb-3 w-fit rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {t("line.loadingOlder")}
                </div>
              )}

              {messagesQuery.isLoading && selectedConversation && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  Loading messages...
                </div>
              )}

              {messagesQuery.isError && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-destructive">
                  Failed to load messages
                </div>
              )}

              {!messagesQuery.isLoading && selectedConversation && messages.length === 0 && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  No messages yet
                </div>
              )}

              {!selectedConversation && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  Select a conversation from the inbox
                </div>
              )}

              {messages.map((message, index) => {
                const sender = normalizeSender(message.sender);
                const isUser = sender === "USER";
                const isAdmin = sender === "ADMIN";
                const isAi = sender === "AI";
                const senderLabel = message.sentByAdminId || "AI";
                // ข้อความต่อกันจากคนเดิมชิดกัน 4px เปลี่ยนคนห่าง 16px
                const prev = messages[index - 1];
                const sameSender =
                  prev && (normalizeSender(prev.sender) === "USER") === isUser;
                const gap = index === 0 ? "" : sameSender ? "mt-1" : "mt-4";

                if (isUser) {
                  return (
                    <div key={message.id} className={`flex items-end gap-2.5 ${gap}`}>
                      <Avatar name={selectedName} src={selectedConversation?.lineMember?.pictureUrl} size="xs" />
                      <div className="flex max-w-[70%] flex-col gap-1">
                        <div className="rounded-[18px_18px_18px_6px] bg-muted px-3.5 py-2.5 text-sm leading-[1.55] text-foreground">
                          <MessageContent message={message} />
                        </div>
                        <span className="pl-1 font-mono text-[11px] text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className={`flex justify-end ${gap}`}>
                    <div className="flex max-w-[70%] flex-col items-end gap-1">
                      <div className="rounded-[18px_18px_6px_18px] bg-muted px-3.5 py-2.5 text-sm leading-[1.55] text-foreground">
                        <MessageContent message={message} />
                      </div>
                      <span className="flex items-center gap-1.5 pr-1 text-[11px] text-muted-foreground">
                        {isAi && <GeminiSparkle />}
                        {t("line.repliedBy", { name: senderLabel })}
                        <span className="font-mono">
                          · {formatTime(message.createdAt)}
                          {isAdmin && message.sentStatus ? ` · ${message.sentStatus}` : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="mx-auto w-full max-w-[880px] shrink-0 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-1.5 rounded-2xl border bg-background py-2.5 pl-4 pr-3 shadow-[rgba(0,0,0,0.04)_0px_4px_14px]">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={handleReplyKeyDown}
                disabled={!selectedConversation || sendMessageMutation.isPending}
                placeholder={t("line.replyPlaceholder")}
                aria-label={t("line.replyPlaceholder")}
                rows={2}
                className="max-h-32 min-h-0 resize-none rounded-none border-0 bg-transparent px-0 py-1 text-[15px] leading-normal shadow-none focus-visible:ring-0 dark:bg-transparent md:text-[15px]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-[#16a34a]" />
                  {t("line.connected")}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="hidden text-xs text-muted-foreground sm:inline">{t("line.sendHint")}</span>
                  <Button
                    onClick={sendReply}
                    disabled={!reply.trim() || !selectedConversation || sendMessageMutation.isPending}
                    className="h-[38px] rounded-full bg-foreground pl-3.5 pr-4 text-sm text-background hover:bg-foreground/85"
                  >
                    <ArrowUp className="size-3.5" strokeWidth={2.2} />
                    {sendMessageMutation.isPending ? t("line.sending") : t("line.send")}
                  </Button>
                </div>
              </div>
              {sendMessageMutation.isError && (
                <p className="pt-1 text-xs text-destructive">{t("line.sendFailed")}</p>
              )}
            </div>
          </footer>
        </main>

        {showInfoPanel && selectedConversation && (
          <CustomerPanel
            conversation={selectedConversation}
            messages={messages}
            onClose={() => setIsInfoOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

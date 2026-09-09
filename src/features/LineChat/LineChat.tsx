import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { getIntlLocale } from "@/i18n/format";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bot,
  ChevronDown,
  ImageIcon,
  Menu,
  Search,
  Send,
  SlidersHorizontal,
  Smile,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-11 w-11 text-sm",
  }[size];

  return (
    <div className={`shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-green-100 to-blue-100 ${sizeClass}`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-slate-700 dark:text-slate-900">
          {name.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

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

  return <p className="whitespace-pre-wrap leading-relaxed">{message.text ?? "-"}</p>;
}

const INITIAL_VISIBLE_CONVERSATIONS = 12;
const LOAD_MORE_CONVERSATIONS = 10;

type ChannelId = "all" | "line" | "messenger" | "tiktok";
type QuickFilterId = "all" | "unread";

const CHANNELS: { id: ChannelId; labelKey: string; soon?: boolean }[] = [
  { id: "all", labelKey: "line.channel.all" },
  { id: "line", labelKey: "line.channel.line" },
  { id: "messenger", labelKey: "line.channel.messenger", soon: true },
  { id: "tiktok", labelKey: "line.channel.tiktok", soon: true },
];

const QUICK_FILTERS: { id: QuickFilterId; labelKey: string; soon?: boolean }[] = [
  { id: "all", labelKey: "line.quickFilter.all" },
  { id: "unread", labelKey: "line.quickFilter.unread" },
];

function SoonBadge() {
  const { t } = useTranslation("chat");

  return (
    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-mini">
      {t("line.soon")}
    </span>
  );
}

function ChannelTabs({
  value,
  onChange,
}: {
  value: ChannelId;
  onChange: (id: ChannelId) => void;
}) {
  const { t } = useTranslation("chat");

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {CHANNELS.map((item) => {
        const isActive = item.id === value;

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.soon}
            onClick={() => onChange(item.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary/10 text-primary"
                : item.soon
                  ? "cursor-not-allowed text-mini/70"
                  : "text-mini hover:bg-hover hover:text-normal"
            }`}
          >
            {t(item.labelKey)}
            {item.soon && <SoonBadge />}
          </button>
        );
      })}
    </div>
  );
}

function QuickFilterChips({
  value,
  onChange,
}: {
  value: QuickFilterId;
  onChange: (id: QuickFilterId) => void;
}) {
  const { t } = useTranslation("chat");

  return (
    <div className="flex items-center gap-2 text-xs">
      {QUICK_FILTERS.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {index > 0 && <span className="text-mini/40">|</span>}
          <button
            type="button"
            disabled={item.soon}
            onClick={() => onChange(item.id)}
            className={`transition-colors duration-200 ${
              item.id === value
                ? "font-semibold text-normal"
                : item.soon
                  ? "cursor-not-allowed text-mini/70"
                  : "text-mini hover:text-normal"
            }`}
          >
            {t(item.labelKey)}
          </button>
        </div>
      ))}
    </div>
  );
}

export const LineChat = () => {
  const { t } = useTranslation("chat");
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  const [isInboxOpen, setIsInboxOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<ChannelId>("line");
  const [quickFilter, setQuickFilter] = useState<QuickFilterId>("all");
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CONVERSATIONS);
  const messageListRef = useRef<HTMLDivElement>(null);
  const preservingScrollRef = useRef(false);

  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data ?? [];

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

    return [...conversations].sort(
      (a, b) =>
        direction *
        (new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    );
  }, [conversations, isNewestFirst]);

  const filteredConversations = useMemo(() => {
    // only LINE is connected today, so "all" and "line" resolve to the same list
    const byChannel =
      channel === "all" || channel === "line" ? sortedConversations : [];
    const byQuickFilter =
      quickFilter === "unread"
        ? byChannel.filter((conversation) => conversation.unreadCount > 0)
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
  };

  const handleMessagesScroll = async () => {
    const container = messageListRef.current;
    if (
      !container ||
      container.scrollTop > 0 ||
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

  return (
    <div className="mx-[-20px] h-[calc(100vh-72px)] w-[calc(100%+1rem)] overflow-hidden md:w-[calc(100%+1.5rem)] xl:w-[calc(100%+2.5rem)]">
      <div
        className={`grid h-full w-full grid-cols-1 overflow-hidden rounded-l-2xl bg-background ${
          isInboxOpen
            ? "xl:grid-cols-[310px_minmax(0,1fr)]"
            : "xl:grid-cols-[76px_minmax(0,1fr)]"
        }`}
      >
        <aside className="flex min-h-0 flex-col border-b bg-background/75 backdrop-blur-xl xl:border-b-0 xl:border-r">
          <div className="shrink-0 p-3.5">
            <div className="flex items-center justify-between gap-2">
              {isInboxOpen && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  LINE OA
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={isInboxOpen ? "" : "mx-auto"}
                onClick={() => setIsInboxOpen((value) => !value)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {isInboxOpen && (
              <>
                <div className="mt-3">
                  <ChannelTabs value={channel} onChange={setChannel} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted px-3">
                    <Search className="h-4 w-4 shrink-0 text-mini" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full bg-transparent text-sm text-normal outline-none placeholder:text-mini"
                      placeholder={t("line.searchPlaceholder")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewestFirst((value) => !value)}
                    title={isNewestFirst ? t("line.newestFirst") : t("line.oldestFirst")}
                    aria-label={isNewestFirst ? t("line.newestFirst") : t("line.oldestFirst")}
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      isNewestFirst
                        ? "bg-muted text-mini hover:text-normal"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <SlidersHorizontal className="size-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <QuickFilterChips value={quickFilter} onChange={setQuickFilter} />
                </div>
              </>
            )}
          </div>

          {isInboxOpen && (
            <div className="shrink-0 px-4 pb-2 pt-1">
              <p className="text-xs font-semibold text-normal">{t("line.recent")}</p>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pb-2">
            {conversationsQuery.isLoading && (
              <div className="px-4 py-3 text-xs text-mini">{t("line.loading")}</div>
            )}

            {conversationsQuery.isError && (
              <div className="px-4 py-3 text-xs text-destructive">{t("line.error")}</div>
            )}

            {!conversationsQuery.isLoading && filteredConversations.length === 0 && (
              <div className="px-4 py-3 text-xs text-mini">{t("line.empty")}</div>
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
              const notificationBg = isActive
                ? "bg-primary/10 text-primary"
                : hasUnreadNotification
                  ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
                  : hasReadNotification
                    ? "opacity-70 hover:bg-hover"
                    : "hover:bg-hover";

              return (
                <div
                  key={conversation.id}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full text-left transition-all duration-200 ${
                      notificationBg
                    } ${isInboxOpen ? "px-4 py-3.5" : "px-2 py-3.5"}`}
                  >
                    <div className={`flex items-center ${isInboxOpen ? "gap-3" : "justify-center"}`}>
                      <div className="relative">
                        <Avatar
                          name={displayName}
                          src={conversation.lineMember?.pictureUrl}
                          size="md"
                        />
                        {!isInboxOpen && conversation.unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {isInboxOpen && (
                        <>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`truncate text-[13px] font-medium ${
                                  isActive ? "text-primary" : "text-normal"
                                }`}
                              >
                                {displayName}
                              </p>
                              <span className="shrink-0 text-[11px] text-mini">
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-mini">{preview}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-5 text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}

            {hasMoreConversations && (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) => count + LOAD_MORE_CONVERSATIONS)
                }
                className="flex h-11 w-full items-center justify-center gap-1.5 text-xs font-medium text-mini transition hover:bg-hover hover:text-normal"
              >
                {isInboxOpen ? t("line.showMore") : ""}
                <ChevronDown className="size-3.5" />
              </button>
            )}

            {isInboxOpen && !hasMoreConversations && filteredConversations.length > 0 && (
              <p className="py-3 text-center text-[11px] text-mini/70">
                {t("line.conversationCount", { count: filteredConversations.length })}
              </p>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 w-full flex-col bg-background">
          <header className="border-b px-5 py-4">
            <div className="mx-auto flex w-full max-w-7xl 2xl:max-w-[1500px] items-center justify-between">
              {selectedConversation ? (
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    name={selectedConversation.lineMember?.displayName ?? t("line.defaultUser")}
                    src={selectedConversation.lineMember?.pictureUrl}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-normal">
                      {selectedConversation.lineMember?.displayName ?? t("line.defaultUser")}
                    </p>
                    <p className="truncate text-xs text-mini">
                      {selectedConversation.lineMember?.lineUserId ?? "-"}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-mini">
                    {selectedConversation.status}
                  </span>
                </div>
              ) : (
                <p className="font-semibold text-normal">{t("line.selectConversation")}</p>
              )}
              {selectedConversation?.lineMember?.lastActiveAt && (
                <span className="text-xs text-mini">
                  {t("line.lastActive", {
                    time: formatTime(selectedConversation.lineMember.lastActiveAt),
                  })}
                </span>
              )}
            </div>
          </header>

          <div
            ref={messageListRef}
            onScroll={handleMessagesScroll}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
          >
            <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1500px] space-y-4">
              {messagesQuery.isFetchingNextPage && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-xs text-mini">
                  {t("line.loadingOlder")}
                </div>
              )}

              {messagesQuery.isLoading && selectedConversation && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-mini">
                  Loading messages...
                </div>
              )}

              {messagesQuery.isError && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-destructive">
                  Failed to load messages
                </div>
              )}

              {!messagesQuery.isLoading && selectedConversation && messages.length === 0 && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-mini">
                  No messages yet
                </div>
              )}

              {!selectedConversation && (
                <div className="mx-auto w-fit rounded-full bg-muted px-3 py-1 text-sm text-mini">
                  Select a conversation from the inbox
                </div>
              )}

              {messages.map((message) => {
                const sender = normalizeSender(message.sender);
                const isUser = sender === "USER";
                const isAdmin = sender === "ADMIN";
                const isAi = sender === "AI";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[78%] ${isUser ? "items-start" : "items-end"}`}>
                      <div className={`flex items-end gap-2 ${isUser ? "" : "flex-row-reverse"}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isUser
                            ? "bg-muted text-mini"
                            : isAi
                              ? "bg-primary/10 text-primary"
                              : "bg-primary text-primary-foreground"
                        }`}>
                          {isUser ? <UserRound className="h-4 w-4" /> : isAi ? <Bot className="h-4 w-4" /> : "A"}
                        </div>
                        <div
                          className={`rounded-[1.25rem] px-4 py-2.5 text-[15px] leading-6 ${
                            isUser
                              ? "rounded-bl-md bg-muted text-normal"
                              : isAi
                                ? "rounded-br-md bg-primary/10 text-normal"
                                : "rounded-br-md bg-muted text-normal"
                          }`}
                        >
                          <MessageContent message={message} />
                        </div>
                      </div>
                      <p className={`mt-1 text-[11px] text-mini ${isUser ? "text-left" : "text-right"}`}>
                        {formatTime(message.createdAt)}
                        {isAdmin && message.sentStatus ? ` · ${message.sentStatus}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="border-t bg-background p-4">
            <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1500px] rounded-2xl border bg-muted/50 p-2">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={handleReplyKeyDown}
                disabled={!selectedConversation || sendMessageMutation.isPending}
                placeholder={t("line.replyPlaceholder")}
                className="max-h-36 min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-xs text-mini">{t("line.connected")}</p>
                <Button
                  onClick={sendReply}
                  disabled={!reply.trim() || !selectedConversation || sendMessageMutation.isPending}
                  className="rounded-xl"
                >
                  <Send className="h-4 w-4" />
                  {sendMessageMutation.isPending ? t("line.sending") : t("line.send")}
                </Button>
              </div>
              {sendMessageMutation.isError && (
                <p className="px-1 pt-2 text-xs text-destructive">{t("line.sendFailed")}</p>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

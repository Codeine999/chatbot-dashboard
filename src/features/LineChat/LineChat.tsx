import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ImageIcon,
  Menu,
  MessageCircle,
  Search,
  Send,
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
import type {
  LineChatHistory,
  LineChatMessageType,
  LineChatSender,
} from "./types/lineChat.type";

const formatTime = (date?: string | null) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const normalizeSender = (sender: LineChatSender) => sender.toUpperCase();
const normalizeType = (type: LineChatMessageType) => type.toUpperCase();

function getMessagePreview(message: string, type: LineChatMessageType) {
  const messageType = normalizeType(type);
  if (messageType === "IMAGE") return "[image]";
  if (messageType === "STICKER") return "[sticker]";
  if (messageType === "POSTBACK") return "[postback]";
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
        <div className="flex h-full w-full items-center justify-center font-semibold text-slate-700">
          {name.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

function MessageContent({ message }: { message: LineChatHistory }) {
  const type = normalizeType(message.messageType);

  if (type === "IMAGE") {
    return message.mediaUrl ? (
      <img
        src={message.mediaUrl}
        alt="LINE image message"
        className="max-h-72 rounded-xl object-cover"
      />
    ) : (
      <div className="flex items-center gap-2 text-sm">
        <ImageIcon className="h-4 w-4" />
        Image message unavailable
      </div>
    );
  }

  if (type === "STICKER") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Smile className="h-4 w-4" />
        Sticker {message.stickerPackageId ?? "-"} / {message.stickerId ?? "-"}
      </div>
    );
  }

  if (type === "POSTBACK") {
    return (
      <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
        {message.postbackData ?? "Postback event"}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap leading-relaxed">{message.text ?? "-"}</p>;
}

export const LineChat = () => {
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  const [isInboxOpen, setIsInboxOpen] = useState(true);
  const [search, setSearch] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const preservingScrollRef = useRef(false);

  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data ?? [];

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      ),
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sortedConversations;

    return sortedConversations.filter((conversation) =>
      [
        conversation.lineMember?.displayName,
        conversation.lineMember?.lineUserId,
        conversation.lastMessage,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [search, sortedConversations]);

  useEffect(() => {
    if (!selectedId && sortedConversations[0]) {
      setSelectedId(sortedConversations[0].id);
    }
  }, [selectedId, sortedConversations]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    sortedConversations[0];

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
        className={`grid h-full w-full grid-cols-1 overflow-hidden rounded-l-2xl bg-white ${
          isInboxOpen
            ? "xl:grid-cols-[310px_minmax(0,1fr)]"
            : "xl:grid-cols-[76px_minmax(0,1fr)]"
        }`}
      >
        <aside className="min-h-0 border-b border-slate-200 bg-slate-50/60 xl:border-b-0 xl:border-r">
          <div className="border-b border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              {isInboxOpen && (
                <div>
                  <p className="font-semibold text-slate-950">Inbox</p>
                  <p className="text-xs text-slate-500">Latest chats first</p>
                </div>
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
                <span className="mt-3 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  LINE OA
                </span>
                <div className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search conversation..."
                  />
                </div>
              </>
            )}
          </div>

          <div className={`h-[calc(100%-145px)] overflow-y-auto ${isInboxOpen ? "xl:h-[calc(100%-145px)]" : "xl:h-[calc(100%-73px)]"}`}>
            {conversationsQuery.isLoading && (
              <div className="p-4 text-sm text-slate-500">Loading conversations...</div>
            )}

            {conversationsQuery.isError && (
              <div className="p-4 text-sm text-red-500">Failed to load conversations</div>
            )}

            {!conversationsQuery.isLoading && filteredConversations.length === 0 && (
              <div className="p-4 text-sm text-slate-500">No conversations found</div>
            )}

            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === selectedConversation?.id;
              const displayName = conversation.lineMember?.displayName ?? "LINE User";
              const preview = getMessagePreview(conversation.lastMessage, conversation.lastMessageType);

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full border-b border-slate-200 text-left transition ${
                    isActive ? "bg-white" : "hover:bg-white"
                  } ${isInboxOpen ? "px-4 py-3" : "px-3 py-3"}`}
                >
                  <div className={`flex items-start ${isInboxOpen ? "gap-3" : "justify-center"}`}>
                    <div className="relative">
                      <Avatar
                        name={displayName}
                        src={conversation.lineMember?.pictureUrl}
                        size="md"
                      />
                      {!isInboxOpen && conversation.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-green-500 px-1 text-[10px] font-semibold leading-4 text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    {isInboxOpen && (
                      <>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-slate-900">
                              {displayName}
                            </p>
                            <span className="text-xs text-slate-400">
                              {formatTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {preview}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {conversation.status}
                          </span>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 w-full flex-col bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            {selectedConversation ? (
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  name={selectedConversation.lineMember?.displayName ?? "LINE User"}
                  src={selectedConversation.lineMember?.pictureUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">
                    {selectedConversation.lineMember?.displayName ?? "LINE User"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {selectedConversation.lineMember?.lineUserId ?? "-"}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {selectedConversation.status}
                </span>
              </div>
            ) : (
              <p className="font-semibold text-slate-950">Select a conversation</p>
            )}
            {selectedConversation?.lineMember?.lastActiveAt && (
              <span className="text-xs text-slate-500">
                Last active {formatTime(selectedConversation.lineMember.lastActiveAt)}
              </span>
            )}
          </header>

          <div
            ref={messageListRef}
            onScroll={handleMessagesScroll}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-5 py-5"
          >
            {messagesQuery.isFetchingNextPage && (
              <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
                Loading older messages...
              </div>
            )}

            {messagesQuery.isLoading && selectedConversation && (
              <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-sm text-slate-500 shadow-sm">
                Loading messages...
              </div>
            )}

            {messagesQuery.isError && (
              <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-sm text-red-500 shadow-sm">
                Failed to load messages
              </div>
            )}

            {!messagesQuery.isLoading && selectedConversation && messages.length === 0 && (
              <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-sm text-slate-500 shadow-sm">
                No messages yet
              </div>
            )}

            {!selectedConversation && (
              <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-sm text-slate-500 shadow-sm">
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
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUser
                          ? "bg-white text-slate-600 ring-1 ring-slate-200"
                          : isAi
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-900 text-white"
                      }`}>
                        {isUser ? <UserRound className="h-4 w-4" /> : isAi ? <Bot className="h-4 w-4" /> : "A"}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isUser
                            ? "rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200"
                            : isAi
                              ? "rounded-br-md bg-orange-50 text-slate-700 ring-1 ring-orange-100"
                              : "rounded-br-md bg-slate-900 text-white"
                        }`}
                      >
                        <MessageContent message={message} />
                      </div>
                    </div>
                    <p className={`mt-1 text-xs text-slate-400 ${isUser ? "text-left" : "text-right"}`}>
                      {formatTime(message.createdAt)}
                      {isAdmin && message.sentStatus ? ` · ${message.sentStatus}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="border-t border-slate-200 bg-white p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={handleReplyKeyDown}
                disabled={!selectedConversation || sendMessageMutation.isPending}
                placeholder="Type a reply... Enter to send, Shift+Enter for new line"
                className="max-h-36 min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-xs text-slate-500">Connected to LINE conversation API</p>
                <Button
                  onClick={sendReply}
                  disabled={!reply.trim() || !selectedConversation || sendMessageMutation.isPending}
                  className="rounded-xl bg-green-500 text-white hover:bg-green-600"
                >
                  <Send className="h-4 w-4" />
                  {sendMessageMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
              {sendMessageMutation.isError && (
                <p className="px-1 pt-2 text-xs text-red-500">Failed to send message</p>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

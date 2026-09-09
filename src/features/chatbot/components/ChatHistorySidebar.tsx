import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  LoaderCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminChatRoom } from "../type";

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 8;

type ChatHistorySidebarProps = {
  rooms: AdminChatRoom[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  deletingRoomId?: string;
  mobile?: boolean;
};

const ChatHistorySidebar = ({
  rooms,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  isLoading = false,
  isError = false,
  onRetry,
  deletingRoomId,
  mobile = false,
}: ChatHistorySidebarProps) => {
  const { t } = useTranslation("chat");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const sortedConversations = useMemo(
    () =>
      [...rooms].sort(
        (left, right) =>
          new Date(right.lastMessageAt).getTime() -
          new Date(left.lastMessageAt).getTime()
      ),
    [rooms]
  );

  const visibleConversations = sortedConversations.slice(0, visibleCount);
  const hasMore = visibleCount < sortedConversations.length;

  useEffect(() => {
    if (!activeId) return;
    const activeIndex = sortedConversations.findIndex(
      (conversation) => conversation.id === activeId
    );

    if (activeIndex >= visibleCount) {
      setVisibleCount(activeIndex + 1);
    }
  }, [activeId, sortedConversations, visibleCount]);

  return (
    <aside
      className={cn(
        "w-[17.5rem] shrink-0 flex-col bg-background/75 backdrop-blur-xl",
        mobile ? "flex h-full w-full" : "hidden border-r lg:flex"
      )}
    >
      <div className="shrink-0 p-3.5">
        <Button
          onClick={onNewChat}
          className="h-10 w-full justify-start gap-2 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      <div className="px-4 pb-2 pt-1">
        <p className="text-xs font-semibold text-normal">{t("sidebar.recent")}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="space-y-2 px-2 py-3" aria-label={t("sidebar.loading")}>
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-9 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-destructive">{t("sidebar.error")}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-8 gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : visibleConversations.length === 0 ? (
          <p className="px-2 py-3 text-xs text-mini">{t("sidebar.empty")}</p>
        ) : (
          <div className="space-y-0.5">
            {visibleConversations.map((conversation) => {
              const isActive = conversation.id === activeId;

              return (
                <div
                  key={conversation.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(conversation.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(conversation.id);
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-normal hover:bg-hover"
                  }`}
                >
                  <MessageCircle
                    className={`size-3.5 shrink-0 ${
                      isActive ? "text-primary" : "text-mini"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {conversation.title}
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${conversation.title}`}
                    disabled={deletingRoomId === conversation.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(conversation.id);
                    }}
                    className="rounded-md p-1 text-mini opacity-0 transition hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 disabled:opacity-60 group-hover:opacity-100"
                  >
                    {deletingRoomId === conversation.id ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="min-h-14 shrink-0 border-t p-3">
        {hasMore ? (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => count + LOAD_MORE_COUNT)
            }
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-mini transition hover:bg-hover hover:text-normal"
          >
            Show more
            <ChevronDown className="size-3.5" />
          </button>
        ) : (
          <p className="py-2 text-center text-[11px] text-mini/70">
            {rooms.length} conversations
          </p>
        )}
      </div>
    </aside>
  );
};

export default ChatHistorySidebar;

import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Search,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sidebarNavMock } from "../mock/chatSidebar.mock";
import { SidebarNavRow, SidebarSectionToggle } from "./SidebarRows";
import type { AdminChatRoom } from "../type";
import { groupRoomsByDate } from "../utils/groupRooms";

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
  const [keyword, setKeyword] = useState("");
  // กลุ่มที่ผู้ใช้พับเก็บไว้ (กดที่หัวกลุ่ม)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const comingSoon = () => toast(t("sidebar.comingSoon"));

  const toggleGroup = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const sortedConversations = useMemo(
    () =>
      [...rooms].sort(
        (left, right) =>
          new Date(right.lastMessageAt).getTime() -
          new Date(left.lastMessageAt).getTime()
      ),
    [rooms]
  );

  const filteredConversations = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return sortedConversations;
    return sortedConversations.filter((room) =>
      room.title.toLowerCase().includes(query)
    );
  }, [sortedConversations, keyword]);

  const visibleConversations = filteredConversations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredConversations.length;
  const groups = useMemo(
    () => groupRoomsByDate(visibleConversations),
    [visibleConversations]
  );

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
        "w-[18rem] shrink-0 flex-col bg-inside",
        mobile ? "flex h-full w-full" : "hidden border-r lg:flex"
      )}
    >
      {/* แถวเมนูบนสุด ไอคอนกับข้อความตรงแนวเดียวกันทุกแถว */}
      <div className="shrink-0 space-y-0.5 px-2 pt-3">
        {/* ไม่มีห้องที่เลือก = อยู่หน้าแชทใหม่ ไฮไลต์แถวนี้ */}
        <SidebarNavRow
          icon={Plus}
          label={t("sidebar.newChat")}
          active={!activeId}
          onClick={onNewChat}
        />

        <label className="flex h-9 w-full cursor-text items-center gap-3 rounded-lg px-3 text-sm text-normal transition-colors focus-within:bg-hover hover:bg-hover">
          <Search className="size-[18px] shrink-0" aria-hidden />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("sidebar.search")}
            aria-label={t("sidebar.search")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-normal focus:placeholder:text-mini"
          />
        </label>

        {sidebarNavMock.map(({ key, icon }) => (
          <SidebarNavRow
            key={key}
            icon={icon}
            label={t(`sidebar.nav.${key}`)}
            onClick={comingSoon}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {isLoading ? (
          <div className="space-y-2 px-1 py-3" aria-label={t("sidebar.loading")}>
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-9 animate-pulse rounded-xl bg-hover"
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
              {t("messages.retry")}
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <p className="px-2 py-3 text-xs text-mini">
            {keyword ? t("sidebar.noResult") : t("sidebar.empty")}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.key} className="mt-4">
              <SidebarSectionToggle
                label={t(`sidebar.group.${group.key}`)}
                collapsed={collapsed.has(group.key)}
                onToggle={() => toggleGroup(group.key)}
              />
              <div className={cn("space-y-0.5", collapsed.has(group.key) && "hidden")}>
                {group.rooms.map((conversation) => {
                  const isActive = conversation.id === activeId;
                  const isDeleting = deletingRoomId === conversation.id;

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
                      className={cn(
                        "group flex h-9 cursor-pointer items-center gap-2 rounded-lg pl-3 pr-1.5 text-left transition-colors duration-200",
                        isActive ? "bg-hover text-normal" : "text-normal hover:bg-hover"
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {conversation.title}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={t("sidebar.options")}
                            disabled={isDeleting}
                            onClick={(event) => event.stopPropagation()}
                            className={cn(
                              "rounded-md p-1 text-mini transition hover:text-normal focus-visible:opacity-100 disabled:opacity-60",
                              isActive || isDeleting
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            )}
                          >
                            {isDeleting ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="size-4" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl p-1.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(conversation.id)}
                          >
                            <Trash2 className="size-4" />
                            {t("sidebar.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => count + LOAD_MORE_COUNT)
            }
            className="mt-1 flex h-8 w-full cursor-pointer items-center rounded-lg px-3 text-xs text-mini transition hover:text-normal"
          >
            {t("sidebar.showMore")}
          </button>
        )}
      </div>
    </aside>
  );
};

export default ChatHistorySidebar;

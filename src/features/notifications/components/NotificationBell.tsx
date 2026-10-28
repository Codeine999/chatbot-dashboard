import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/useNotifications";
import { groupNotificationsByDay } from "../lib/groupNotifications";
import type { AdminNotification } from "../types/notification.type";
import { NotificationItem } from "./NotificationItem";

type Tab = "all" | "unread";

const GroupLabel = ({ children }: { children: string }) => (
  <p className="px-5 pb-1 pt-3 text-xs text-mini">{children}</p>
);

/** ปุ่มกระดิ่งบน navbar พร้อมแผงแจ้งเตือน (ต้องเรียก useNotificationSocket ที่ระดับบนอีกที) */
export const NotificationBell = () => {
  const { t } = useTranslation("nav");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  const notificationsQuery = useNotifications();
  const unreadCount = useUnreadNotificationCount().data ?? 0;
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const all = notificationsQuery.data ?? [];
  const visible = tab === "unread" ? all.filter((item) => !item.isRead) : all;
  const groups = groupNotificationsByDay(visible);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleItemClick = (notification: AdminNotification) => {
    if (!notification.isRead) markAsRead.mutate(notification.id);
    const conversationId = notification.metadata?.conversationId;
    if (conversationId) goTo(`/chat/line?conversationId=${conversationId}`);
  };

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: "all", label: t("notification.tabAll") },
    { value: "unread", label: t("notification.tabUnread"), count: unreadCount },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="nav" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex max-h-[min(640px,calc(100dvh-5rem))] w-[min(380px,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl p-0 shadow-xl"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-normal">{t("notification.title")}</h2>
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="cursor-pointer text-sm font-medium text-icons transition hover:opacity-80 disabled:cursor-default disabled:opacity-50"
          >
            {t("notification.markAllRead")}
          </button>
        </div>

        <div role="tablist" className="mt-3 flex gap-6 border-b px-5">
          {tabs.map(({ value, label, count }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(value)}
                className={cn(
                  "-mb-px flex cursor-pointer items-center gap-2 border-b-2 pb-2.5 text-[15px] transition",
                  active
                    ? "border-normal font-semibold text-normal"
                    : "border-transparent text-mini hover:text-normal"
                )}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-hover px-1.5 text-xs font-medium text-mini">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-1">
          {visible.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-mini">
              {t(tab === "unread" ? "notification.emptyUnread" : "notification.empty")}
            </p>
          )}

          {groups.today.length > 0 && (
            <>
              <GroupLabel>{t("notification.today")}</GroupLabel>
              {groups.today.map((item) => (
                <NotificationItem key={item.id} notification={item} showClock onClick={handleItemClick} />
              ))}
            </>
          )}

          {groups.earlier.length > 0 && (
            <>
              {groups.today.length > 0 && <div className="mt-2 border-t" />}
              <GroupLabel>{t("notification.earlier")}</GroupLabel>
              {groups.earlier.map((item) => (
                <NotificationItem
                  key={item.id}
                  notification={item}
                  showClock={false}
                  onClick={handleItemClick}
                />
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-5 py-3.5">
          <button
            type="button"
            onClick={() => goTo("/chat/line")}
            className="cursor-pointer text-sm font-semibold text-normal hover:underline"
          >
            {t("notification.viewAll")}
          </button>
          <button
            type="button"
            onClick={() => goTo("/setting/admin/over-all")}
            className="flex cursor-pointer items-center gap-1.5 text-sm text-mini transition hover:text-normal"
          >
            <Settings className="size-[18px]" />
            {t("notification.settings")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

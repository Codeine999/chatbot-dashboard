import { formatTime } from "@/i18n/format";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { AdminNotification } from "../types/notification.type";
import { NotificationAvatar } from "./NotificationAvatar";

export const NotificationItem = ({
  notification,
  /** วันนี้แสดงเวลา (05:16) ก่อนหน้านี้แสดงแบบ "4 วันที่แล้ว" */
  showClock,
  onClick,
}: {
  notification: AdminNotification;
  showClock: boolean;
  onClick: (notification: AdminNotification) => void;
}) => {
  const meta = notification.metadata;
  const title = meta?.displayName ?? notification.title;
  const preview = meta?.lastMessage ?? notification.message ?? "";

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
    >
      <NotificationAvatar notification={notification} title={title} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              "truncate text-[15px] text-normal",
              !notification.isRead ? "font-semibold" : "font-medium"
            )}
          >
            {title}
          </span>
          <span className="shrink-0 text-xs text-mini">
            {showClock
              ? formatTime(notification.createdAt)
              : formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="truncate text-sm text-mini">{preview}</p>
      </div>

      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          notification.isRead ? "bg-transparent" : "bg-primary"
        )}
        aria-hidden
      />
    </button>
  );
};

import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminNotification } from "../types/notification.type";

const AVATAR_COLORS = [
  "bg-primary",
  "bg-sky-500",
  "bg-orange-500",
  "bg-emerald-600",
  "bg-rose-500",
  "bg-amber-500",
];

/** สีเดิมทุกครั้งสำหรับชื่อเดียวกัน */
const colorFor = (name: string) => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/**
 * รูปลูกค้า LINE พร้อมป้ายไอคอนมุมล่างขวา
 * การแจ้งเตือนของระบบ (ไม่มี conversation) ใช้วงกลมสีเข้มกับป้ายสีเข้มแทน
 */
export const NotificationAvatar = ({
  notification,
  title,
}: {
  notification: AdminNotification;
  title: string;
}) => {
  const meta = notification.metadata;
  const isChat = Boolean(meta?.conversationId);

  return (
    <div className="relative size-12 shrink-0">
      {isChat ? (
        <Avatar className="size-12">
          {meta?.pictureUrl && <AvatarImage src={meta.pictureUrl} alt={title} />}
          <AvatarFallback className={`${colorFor(title)} text-lg font-semibold text-white`}>
            {title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="block size-12 rounded-full bg-zinc-900 dark:bg-zinc-700" />
      )}

      <span
        className={`absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-popover ${
          isChat ? "bg-green-500 text-white" : "bg-zinc-900 dark:bg-zinc-600"
        }`}
      >
        {isChat && <MessageCircle className="size-3 fill-current" />}
      </span>
    </div>
  );
};

import { LoaderCircle, MessageCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/i18n/format";
import type { AppConversation } from "../type";

type Props = {
  rooms: AppConversation[] | undefined;
  isLoading: boolean;
  error: boolean;
  selectedId: string | undefined;
  /** ห้องของลูกค้าจำลองในแท็บนี้ */
  mineId: string | undefined;
  newDisabled: boolean;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
};

const WAITING_ADMIN = "waiting_admin";

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export function AppRoomList({
  rooms,
  isLoading,
  error,
  selectedId,
  mineId,
  newDisabled,
  onSelect,
  onNew,
}: Props) {
  const { t } = useTranslation("chat");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("appChat.rooms")}</h3>
        <Button variant="outline" size="sm" disabled={newDisabled} onClick={onNew}>
          <Plus className="size-3.5" />
          {t("appChat.newRoom")}
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {t("appChat.roomsLoading")}
          </p>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            {t("appChat.roomsError")}
          </p>
        ) : !rooms?.length ? (
          <p className="text-sm text-muted-foreground">{t("appChat.roomsEmpty")}</p>
        ) : (
          rooms.map((room) => {
            const waiting = room.status === WAITING_ADMIN;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelect(room.id)}
                aria-current={room.id === selectedId}
                className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                  room.id === selectedId
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:bg-hover"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <MessageCircle className="size-4 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium">
                      {room.contact.displayName || room.contact.id.slice(0, 8)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {isToday(room.lastMessageAt)
                      ? formatTime(room.lastMessageAt)
                      : formatDate(room.lastMessageAt)}
                  </span>
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {room.lastMessage}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {room.id === mineId && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {t("appChat.mine")}
                    </span>
                  )}
                  {waiting && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      {t("appChat.waitingAdmin")}
                    </span>
                  )}
                  {room.unreadCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                      {room.unreadCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

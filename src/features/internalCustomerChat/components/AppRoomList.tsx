import { LoaderCircle, Plus, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
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
    <div className="flex min-h-0 flex-1 flex-col pt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs text-muted-foreground">{t("appChat.rooms")}</h3>
        <button
          type="button"
          disabled={newDisabled}
          onClick={onNew}
          className="inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          {t("appChat.newRoom")}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
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
                className={`flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                  room.id === selectedId ? "bg-muted" : "hover:bg-muted/60"
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-normal dark:bg-white/10">
                  <Smartphone className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {room.contact.displayName || room.contact.id.slice(0, 8)}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {isToday(room.lastMessageAt)
                        ? formatTime(room.lastMessageAt)
                        : formatDate(room.lastMessageAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-muted-foreground">{room.lastMessage}</span>
                    {room.unreadCount > 0 && (
                      <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-medium text-background">
                        {room.unreadCount}
                      </span>
                    )}
                  </span>
                  {(room.id === mineId || waiting) && (
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {room.id === mineId && (
                        <span className="rounded-md border px-1.5 py-0.5 text-[11px] text-normal">
                          {t("appChat.mine")}
                        </span>
                      )}
                      {waiting && (
                        <span className="rounded-md bg-[#f5f2ef] px-1.5 py-0.5 text-[11px] text-[#c2410c] dark:bg-white/10">
                          {t("appChat.waitingAdmin")}
                        </span>
                      )}
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

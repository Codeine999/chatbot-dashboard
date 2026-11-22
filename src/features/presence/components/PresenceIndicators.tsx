import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRoomViewers } from "../hooks/usePresence";
import type { PresenceChannel, PresenceViewer } from "../types";

const MAX_CHIPS = 3;

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "?";
const namesOf = (viewers: PresenceViewer[]) => viewers.map((viewer) => viewer.name).join(", ");

/** วงกลมตัวอักษรย่อของผู้ดูแลที่เปิดห้องอยู่ (ซ้อนกันเล็กน้อย) */
function ViewerChips({ viewers }: { viewers: PresenceViewer[] }) {
  const { t } = useTranslation("chat");
  if (viewers.length === 0) return null;

  const shown = viewers.slice(0, MAX_CHIPS);
  const rest = viewers.length - shown.length;

  return (
    <span
      className="flex shrink-0 items-center -space-x-1.5"
      title={t("line.presence.viewing", { names: namesOf(viewers) })}
    >
      {shown.map((viewer) => (
        <span
          key={viewer.adminId}
          className={`flex size-5 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold ${
            viewer.typing ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          }`}
        >
          {initialOf(viewer.name)}
        </span>
      ))}
      {rest > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
          {t("line.presence.more", { rest })}
        </span>
      )}
    </span>
  );
}

/** ใช้ในแถวรายการห้อง: แสดงวงกลมของคนที่เปิดอยู่ (ไม่รวมตัวเอง) */
export function RowViewers({
  channel,
  conversationId,
}: {
  channel: PresenceChannel | null;
  conversationId: string;
}) {
  const { others } = useRoomViewers(channel, conversationId);
  return <ViewerChips viewers={others} />;
}

/**
 * ใช้ในแถวรายการห้อง: ถ้ามีคนกำลังพิมพ์ จะแทนที่บรรทัดข้อความล่าสุดด้วยชื่อคนพิมพ์
 * ไม่มีใครพิมพ์ จะแสดง children (ข้อความล่าสุดเดิม)
 */
export function RowPresence({
  channel,
  conversationId,
  children,
}: {
  channel: PresenceChannel | null;
  conversationId: string;
  children: ReactNode;
}) {
  const { t } = useTranslation("chat");
  const { typing } = useRoomViewers(channel, conversationId);

  if (typing.length === 0) return children;

  return (
    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary">
      {t("line.presence.typing", { names: namesOf(typing) })}
    </span>
  );
}

/** แถบเล็ก ๆ เหนือช่องพิมพ์ในห้องแชท: แค่แสดงข้อมูล ไม่บล็อกการส่ง */
export function RoomPresenceBar({
  channel,
  conversationId,
}: {
  channel: PresenceChannel | null;
  conversationId: string | undefined;
}) {
  const { t } = useTranslation("chat");
  const { others, typing } = useRoomViewers(channel, conversationId ?? "");

  if (!conversationId || others.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 pb-1.5 text-xs text-muted-foreground">
      <span className="flex min-w-0 items-center gap-1.5">
        <ViewerChips viewers={others} />
        <span className="truncate">{t("line.presence.viewing", { names: namesOf(others) })}</span>
      </span>
      {typing.length > 0 && (
        <span className="truncate font-medium text-primary">
          {t("line.presence.typing", { names: namesOf(typing) })}
        </span>
      )}
    </div>
  );
}

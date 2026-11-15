import { useTranslation } from "react-i18next";
import { formatTime } from "@/i18n/format";
import { messageBubbleClass } from "./TestChatParts";
import type { AppHistoryMessage } from "../type";

/**
 * มุมมองของห้อง: ลูกค้าอยู่ขวา ส่วนบอท/แอดมิน/ระบบอยู่ซ้าย
 * (backend คืน sender ตัวใหญ่ที่ admin API และตัวเล็กที่ guest API)
 */
export function AppMessageBubble({ message }: { message: AppHistoryMessage }) {
  const { t } = useTranslation("chat");
  const sender = message.sender.toLowerCase();
  const isCustomer = sender === "user";
  const source = message.metadata?.source;

  const label =
    sender === "user"
      ? t("appChat.roleCustomer")
      : sender === "admin"
        ? t("appChat.roleAdmin")
        : sender === "system"
          ? t("appChat.roleSystem")
          : t("appChat.roleBot");

  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div className={messageBubbleClass(isCustomer ? "customer" : "other")}>
        <p className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {label}
          {sender === "ai" && source && (
            <span className="rounded bg-background px-1.5 py-0.5 font-mono uppercase">{source}</span>
          )}
          <span className="font-mono">{formatTime(message.createdAt)}</span>
        </p>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">{message.text}</p>
        {message.metadata?.handoff && (
          <p className="mt-2 text-[10px] text-amber-600">{t("appChat.handoff")}</p>
        )}
      </div>
    </div>
  );
}

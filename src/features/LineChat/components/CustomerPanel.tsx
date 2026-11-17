import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/features/user/components/UserVisuals";
import { getIntlLocale } from "@/i18n/format";
import { LineIcon, MessengerIcon, TikTokIcon, ApplicationIcon } from "./ChannelIcons";
import type {
  ConversationPlatform,
  LineChatHistory,
  LineConversation,
} from "../types/lineChat.type";

const PLATFORM_ICONS: Record<ConversationPlatform, React.ElementType> = {
  line: LineIcon,
  messenger: MessengerIcon,
  tiktok: TikTokIcon,
  application: ApplicationIcon,
};

const GRADE_TH: Record<string, string> = {
  NORMAL: "ลูกค้าธรรมดา",
  VIP: "ลูกค้าประจำ",
  VVIP: "ลูกค้าคนพิเศษ",
};

const formatDateTime = (date?: string | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-muted-foreground">{children}</span>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-2 text-[13px]">
    <span className="text-muted-foreground">{label}</span>
    <span className="flex min-w-0 items-center gap-1.5 text-foreground">{children}</span>
  </div>
);

type Props = {
  conversation: LineConversation;
  /** ข้อความที่โหลดอยู่ในหน้าจอ ใช้สรุปสัดส่วนผู้ส่ง */
  messages: LineChatHistory[];
  onClose: () => void;
};

export const CustomerPanel = ({ conversation, messages, onClose }: Props) => {
  const { t, i18n } = useTranslation("chat");
  const [copied, setCopied] = useState(false);

  const member = conversation.lineMember;
  const name = member?.displayName ?? t("line.defaultUser");
  const platform = conversation.platform ?? "line";
  const PlatformIcon = PLATFORM_ICONS[platform] ?? LineIcon;
  const platformLabel = t(`line.channel.${platform}`, { defaultValue: "LINE" });
  // grade: ภาษาไทย map NORMAL/VIP/VVIP เป็นคำไทย ภาษาอังกฤษและค่าอื่นแสดง raw
  const grade = conversation.grade ?? member?.grade ?? null;
  const gradeLabel =
    grade && i18n.language?.startsWith("th") ? (GRADE_TH[grade.toUpperCase()] ?? grade) : grade;
  const isWaiting = conversation.status === "waiting_admin";

  const counts = messages.reduce(
    (acc, message) => {
      const sender = message.sender.toUpperCase();
      if (sender === "USER") acc.user += 1;
      else if (sender === "ADMIN" || message.sentByAdminId) acc.admin += 1;
      else if (sender === "AI") acc.ai += 1;
      return acc;
    },
    { user: 0, ai: 0, admin: 0 },
  );
  const total = counts.user + counts.ai + counts.admin;
  const segments = [
    { key: "user", label: t("line.panel.customer"), value: counts.user, color: "bg-foreground" },
    { key: "ai", label: "AI", value: counts.ai, color: "bg-primary" },
    { key: "admin", label: t("line.panel.admin"), value: counts.admin, color: "bg-orange-400" },
  ];

  const handleCopy = async () => {
    if (!member?.lineUserId) return;
    try {
      await navigator.clipboard.writeText(member.lineUserId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard ใช้ไม่ได้ ไม่ต้องทำอะไร */
    }
  };

  return (
    <aside
      aria-label={t("line.panel.title")}
      className="hidden min-h-0 flex-col overflow-y-auto border-l bg-background xl:flex"
    >
      <div className="flex min-h-16 shrink-0 items-center justify-between border-b pl-5 pr-3">
        <span className="text-sm font-semibold text-foreground">{t("line.panel.title")}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("line.panel.close")}
          className="size-9 cursor-pointer rounded-lg"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* profile */}
      <div className="flex flex-col items-center gap-1.5 border-b px-5 pb-5 pt-6 text-center">
        <span className="relative">
          <UserAvatar name={name} src={member?.pictureUrl ?? undefined} className="size-16 text-2xl" />
          <span className="absolute bottom-0 right-0 flex size-[18px] items-center justify-center rounded-full bg-background ring-[3px] ring-background">
            <PlatformIcon className="size-[18px]" />
          </span>
        </span>
        <span className="mt-1.5 max-w-full truncate text-[17px] font-semibold text-foreground">{name}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
          <PlatformIcon className="size-3" />
          {platformLabel}
        </span>
      </div>

      {/* status */}
      <div className="flex flex-col gap-3 border-b px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>{t("line.panel.status")}</SectionTitle>
          {gradeLabel && <span className="text-[13px] font-medium text-foreground">{gradeLabel}</span>}
        </div>
        <Row label={t("line.panel.conversation")}>
          {isWaiting ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-orange-700 dark:text-orange-300">
              <span className="size-1.5 rounded-full bg-orange-600" />
              {t("line.status.waiting_admin")}
            </span>
          ) : (
            <span className="font-medium">
              {t(`line.status.${conversation.status}`, { defaultValue: conversation.status })}
            </span>
          )}
        </Row>
        <Row label={t("line.panel.handler")}>
          <span className="font-medium">
            {t(`line.panel.botMode.${conversation.botMode}`, { defaultValue: "AI" })}
          </span>
        </Row>
        <Row label={t("line.panel.lastActive")}>
          <span className="font-mono text-xs">{formatDateTime(member?.lastActiveAt)}</span>
        </Row>
      </div>

      {/* message stats */}
      <div className="flex flex-col gap-3 border-b px-5 py-4">
        <div className="flex items-baseline justify-between">
          <SectionTitle>{t("line.panel.totalMessages")}</SectionTitle>
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{total}</span>
        </div>
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-[3px] bg-muted">
          {segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <span key={segment.key} className={segment.color} style={{ flex: segment.value }} />
            ))}
        </div>
        <div className="flex flex-col gap-2 text-[13px]">
          {segments.map((segment) => (
            <div key={segment.key} className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className={`size-2 rounded-full ${segment.color}`} />
                {segment.label}
              </span>
              <span className="tabular-nums text-foreground">{segment.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* details */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <SectionTitle>{t("line.panel.info")}</SectionTitle>
        <Row label={t("line.panel.platform")}>
          <PlatformIcon className="size-3.5" />
          {platformLabel}
        </Row>
        <Row label="User ID">
          <span title={member?.lineUserId} className="max-w-[130px] truncate font-mono text-xs">
            {member?.lineUserId ?? "-"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("line.panel.copyUserId")}
            className="size-7 cursor-pointer rounded-md text-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </Row>
      </div>
    </aside>
  );
};

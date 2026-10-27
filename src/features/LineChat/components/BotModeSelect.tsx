import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Check, ChevronDown, Loader2, PauseCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useResumeBot } from "../hooks/useLineChat";
import type { BotMode, LineConversation } from "../types/lineChat.type";

const MODES: {
  id: BotMode;
  icon: React.ElementType;
  dot: string;
  /** true = ตั้งจากหน้าจอนี้ไม่ได้ เพราะ backend ยังไม่มี endpoint */
  unavailable: boolean;
}[] = [
  { id: "auto", icon: Bot, dot: "bg-emerald-500", unavailable: false },
  { id: "admin", icon: UserRound, dot: "bg-blue-500", unavailable: true },
  { id: "paused", icon: PauseCircle, dot: "bg-slate-400", unavailable: true },
];

/** นับถอยหลังต้องขยับเอง ไม่งั้นค่าค้างและไม่กลับเป็น auto ตอนครบเวลา */
const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
};

type Props = {
  conversation: LineConversation;
};

export const BotModeSelect = ({ conversation }: Props) => {
  const { t } = useTranslation("chat");
  const resumeBot = useResumeBot();
  const now = useNow(15_000);

  const mode = conversation.botMode;
  const resumesAt = conversation.botMuteUntil
    ? new Date(conversation.botMuteUntil).getTime()
    : undefined;
  const minutesLeft = resumesAt ? Math.max(1, Math.ceil((resumesAt - now) / 60_000)) : 0;
  const current = MODES.find((item) => item.id === mode) ?? MODES[0];
  const CurrentIcon = current.icon;

  // ห้องที่ค้าง waiting_admin ก็ปลดได้: resume-bot ตั้งสถานะกลับเป็น open ให้
  const canResume = mode !== "auto" || conversation.status === "waiting_admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 rounded-full px-3 text-xs font-medium"
          disabled={resumeBot.isPending}
        >
          {resumeBot.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <span className={cn("size-2 rounded-full", current.dot)} />
          )}
          <CurrentIcon className="size-3.5 text-mini" />
          <span>{t(`line.bot.mode.${mode}.label`)}</span>
          {mode === "admin" && (
            <span className="text-mini">
              · {t("line.bot.minutesShort", { minutes: minutesLeft })}
            </span>
          )}
          <ChevronDown className="size-3.5 text-mini" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-mini">
          {t("line.bot.title")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {MODES.map((item) => {
          const Icon = item.icon;
          const isCurrent = item.id === mode;
          // มีเฉพาะ "auto" ที่กดเลือกได้ และต้องมีอะไรให้ปลดจริง
          const disabled = item.unavailable || (item.id === "auto" && !canResume);

          return (
            <DropdownMenuItem
              key={item.id}
              disabled={disabled}
              onSelect={() => {
                if (item.id === "auto" && canResume) resumeBot.mutate(conversation.id);
              }}
              className="cursor-pointer items-start gap-3 py-2.5"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-mini" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-normal">
                  {t(`line.bot.mode.${item.id}.label`)}
                  {item.id === "paused" && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-mini">
                      {t("line.soon")}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-mini">
                  {item.id === "admin" && isCurrent
                    ? t("line.bot.mode.admin.activeHint", { minutes: minutesLeft })
                    : item.id === "auto" && canResume
                      ? t("line.bot.mode.auto.resumeHint")
                      : t(`line.bot.mode.${item.id}.hint`)}
                </p>
              </div>
              {isCurrent && <Check className="mt-0.5 size-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

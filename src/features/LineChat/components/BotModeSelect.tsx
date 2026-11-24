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
import { formatDate, formatTime } from "@/i18n/format";
import { useChangeBotMode } from "../hooks/useLineChat";
import type { BotMode, LineConversation } from "../types/lineChat.type";

const MODES: { id: BotMode; icon: React.ElementType; dot: string }[] = [
  { id: "auto", icon: Bot, dot: "bg-emerald-500" },
  { id: "admin", icon: UserRound, dot: "bg-blue-500" },
  { id: "paused", icon: PauseCircle, dot: "bg-slate-400" },
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
  const changeMode = useChangeBotMode();
  const now = useNow(15_000);

  const mode = conversation.botMode;
  const resumesAt = conversation.botMuteUntil
    ? new Date(conversation.botMuteUntil).getTime()
    : undefined;
  const minutesLeft = resumesAt ? Math.max(1, Math.ceil((resumesAt - now) / 60_000)) : 0;
  const current = MODES.find((item) => item.id === mode) ?? MODES[0];
  
  // ห้องที่ค้าง waiting_admin ก็ปลดได้: resume-bot ตั้งสถานะกลับเป็น open ให้
  const canResume = mode !== "auto" || conversation.status === "waiting_admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-[38px] gap-2 rounded-[10px] px-3 text-[13px] font-medium shadow-none"
          disabled={changeMode.isPending}
        >
          {changeMode.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <span className={cn("size-[7px] rounded-full ring-[3px] ring-black/5", current.dot)} />
          )}
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
          // auto ต้องมีอะไรให้ปลดจริง, paused ที่พักอยู่แล้วไม่ต้องกดซ้ำ
          // admin กดซ้ำได้: ต่อเวลาเงียบใหม่
          const disabled =
            changeMode.isPending ||
            (item.id === "auto" && !canResume) ||
            (item.id === "paused" && isCurrent);

          return (
            <DropdownMenuItem
              key={item.id}
              disabled={disabled}
              onSelect={() => changeMode.mutate({
                conversationId: conversation.id,
                mode: item.id,
                platform: conversation.platform,
              })}
              className="cursor-pointer items-start gap-3 py-2.5"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-mini" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-normal">
                  {t(`line.bot.mode.${item.id}.label`)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-mini">
                  {item.id === "admin" && isCurrent
                    ? t("line.bot.mode.admin.activeHint", { minutes: minutesLeft })
                    : item.id === "paused" && isCurrent && conversation.botMuteUntil
                      ? t("line.bot.mode.paused.activeHint", {
                          date: `${formatDate(conversation.botMuteUntil)} ${formatTime(conversation.botMuteUntil)}`,
                        })
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

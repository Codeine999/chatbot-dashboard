import { Bot, MessagesSquare, UserCheck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedNumber, StaggerGroup, StaggerItem } from "@/components/motion";
import { Sparkline } from "@/features/home/components/Sparkline";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { ChatAnalyticsSummary } from "../types/chatAnalytics.type";

type ChatKpiStripProps = {
  summary: ChatAnalyticsSummary | undefined;
  isLoading: boolean;
};

export const ChatKpiStrip = ({ summary, isLoading }: ChatKpiStripProps) => {
  const { t } = useTranslation("report");

  const items = [
    {
      id: "total-messages",
      title: t("analytics.chat.kpi.totalMessages"),
      description: t("analytics.chat.kpi.totalMessagesDesc"),
      icon: MessagesSquare,
      iconColor: "text-[#5048e4]",
      points: [26, 22, 24, 18, 20, 14, 16, 9, 12, 4],
      value: summary?.totalMessages30d ?? null,
      decimals: 0,
      format: (v: number) => formatNumber(Math.round(v)),
    },
    {
      id: "ai-resolution",
      title: t("analytics.chat.kpi.aiResolution"),
      description: t("analytics.chat.kpi.aiResolutionDesc"),
      icon: Bot,
      iconColor: "text-[#16a34a]",
      points: [20, 19, 17, 18, 14, 13, 11, 10, 8, 6],
      value: summary?.aiResolutionPercent ?? null,
      decimals: 0,
      format: (v: number) => `${Math.round(v)}%`,
    },
    {
      id: "admin-handoff",
      title: t("analytics.chat.kpi.adminHandoff"),
      description: t("analytics.chat.kpi.adminHandoffDesc"),
      icon: UserCheck,
      iconColor: "text-[#ea580c]",
      points: [12, 14, 13, 16, 15, 18, 17, 20, 19, 22],
      value: summary?.adminHandoffPercent ?? null,
      decimals: 0,
      format: (v: number) => `${Math.round(v)}%`,
    },
    {
      id: "avg-response",
      title: t("analytics.chat.kpi.avgResponse"),
      description: t("analytics.chat.kpi.avgResponseDesc"),
      icon: Zap,
      iconColor: "text-[#2563eb]",
      points: [22, 20, 18, 19, 15, 14, 12, 11, 9, 8],
      value: summary?.avgResponseSec ?? null,
      decimals: 1,
      suffix: t("analytics.chat.kpi.avgResponseUnit"),
      format: (v: number) => v.toFixed(1),
    },
  ];

  return (
    <StaggerGroup
      stagger={0.08}
      delayChildren={0.08}
      className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-y-7"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const empty = isLoading || item.value === null;

        return (
          <StaggerItem
            key={item.id}
            y={14}
            className={cn(
              "group flex flex-col gap-2.5 py-0.5",
              index === 0 ? "pr-7" : "border-l px-7",
              index === items.length - 1 && "pr-0"
            )}
          >
            <span className="flex items-center gap-2 text-[15px] text-normal">
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110",
                  item.iconColor
                )}
                strokeWidth={1.7}
              />
              <span className="truncate">{item.title}</span>
            </span>

            <div className="flex items-end justify-between gap-4">
              <span
                className={cn(
                  "text-[28px] font-semibold leading-none tracking-[-0.025em] tabular-nums transition-colors duration-300",
                  empty ? "text-[#b5b0aa]" : "text-foreground"
                )}
              >
                {empty ? (
                  "—"
                ) : (
                  <>
                    <AnimatedNumber
                      value={item.value as number}
                      decimals={item.decimals}
                      format={item.format}
                    />
                    {item.suffix && (
                      <span className="ml-1.5 text-xs font-medium text-mini">
                        {item.suffix}
                      </span>
                    )}
                  </>
                )}
              </span>

              <Sparkline
                points={item.points}
                delay={0.18 + index * 0.08}
                className={cn(
                  "pointer-events-none h-7 w-[88px] shrink-0 transition-opacity duration-300 group-hover:opacity-100",
                  item.iconColor
                )}
              />
            </div>

            <span className="text-[13px] text-muted-foreground">
              {item.description}
            </span>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
};

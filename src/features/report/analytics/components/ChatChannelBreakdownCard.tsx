import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber, StaggerGroup, StaggerItem } from "@/components/motion";
import { formatNumber } from "@/i18n/format";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import type {
  ChatChannelStat,
  ChatTopicStat,
} from "../types/chatAnalytics.type";

type ChatChannelBreakdownCardProps = {
  channels: ChatChannelStat[];
  topics: ChatTopicStat[];
  isLoading: boolean;
};

export const ChatChannelBreakdownCard = ({
  channels,
  topics,
  isLoading,
}: ChatChannelBreakdownCardProps) => {
  const { t } = useTranslation("report");
  const prefersReduced = useReducedMotion();

  if (isLoading) {
    return (
      <Card variant="flat" className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
          <div className="mt-5 flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="border-t pt-6">
          <Skeleton className="h-5 w-44" />
          <div className="mt-4 flex flex-col gap-3.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="flat" className="flex h-full flex-col justify-between gap-8">
      {/* สัดส่วนตามช่องทาง */}
      <div>
        <CardTitle className="text-lg font-semibold text-foreground">
          {t("analytics.chat.channels.title")}
        </CardTitle>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t("analytics.chat.channels.subtitle")}
        </p>

        <StaggerGroup
          stagger={0.07}
          delayChildren={0.1}
          className="mt-5 flex flex-col gap-4"
        >
          {channels.map((channel, index) => (
            <StaggerItem key={channel.key} y={8} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: channel.color }}
                  />
                  {t(`analytics.chat.channels.items.${channel.key}`)}
                </span>
                <span className="tabular-nums text-[13px] text-normal">
                  <AnimatedNumber value={channel.count} format={formatNumber} />{" "}
                  <span className="text-muted-foreground">
                    {t("analytics.chat.channels.turns")} · {channel.percent}%
                  </span>
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(channel.percent, channel.count > 0 ? 3 : 0)}%`,
                    backgroundColor: channel.color,
                    originX: 0,
                  }}
                  initial={prefersReduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: MOTION_DURATION.chart,
                    delay: 0.2 + index * 0.1,
                    ease: MOTION_EASE.out,
                  }}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      {/* หมวดหมู่คำตอบของ AI */}
      <div className="border-t pt-6">
        <CardTitle className="text-[16px] font-semibold text-foreground">
          {t("analytics.chat.topics.title")}
        </CardTitle>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t("analytics.chat.topics.subtitle")}
        </p>

        <StaggerGroup
          stagger={0.065}
          delayChildren={0.16}
          className="mt-4 flex flex-col gap-3.5"
        >
          {topics.map((topic, index) => (
            <StaggerItem key={topic.key} y={8} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="truncate text-normal">
                    {t(`analytics.chat.topics.items.${topic.key}`)}
                  </span>
                  <span className="shrink-0 font-mono text-xs font-medium tabular-nums text-foreground">
                    {topic.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(topic.percent, topic.count > 0 ? 3 : 0)}%`,
                      backgroundColor: topic.color,
                      originX: 0,
                    }}
                    initial={prefersReduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: MOTION_DURATION.chart,
                      delay: 0.28 + index * 0.09,
                      ease: MOTION_EASE.out,
                    }}
                  />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </Card>
  );
};

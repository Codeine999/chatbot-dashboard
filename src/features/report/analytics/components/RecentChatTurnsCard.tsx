import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, CheckCircle2, FlaskConical, UserRound, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardTitle } from "@/components/ui/card";
import { SegmentedTabs, type SegmentedTabOption } from "@/components/motion";
import { getIntlLocale } from "@/i18n/format";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import type {
  ChatChannelFilter,
  ChatChannelKey,
  RecentChatTurn,
} from "../types/chatAnalytics.type";

type RecentChatTurnsCardProps = {
  turns: RecentChatTurn[];
  isSample: boolean;
};

const CHANNEL_DOT: Record<ChatChannelKey, string> = {
  line: "bg-[#16a34a]",
  facebook: "bg-[#2563eb]",
  api: "bg-[#8b5cf6]",
};

const formatTurnTime = (iso: string) =>
  new Intl.DateTimeFormat(getIntlLocale(), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const RecentChatTurnsCard = ({
  turns,
  isSample,
}: RecentChatTurnsCardProps) => {
  const { t } = useTranslation("report");
  const prefersReduced = useReducedMotion();
  const [channelFilter, setChannelFilter] = useState<ChatChannelFilter>("all");

  const filterOptions: ReadonlyArray<SegmentedTabOption<ChatChannelFilter>> = [
    { value: "all", label: t("analytics.chat.recent.filterAll") },
    { value: "line", label: t("analytics.chat.recent.filterLine") },
    { value: "facebook", label: t("analytics.chat.recent.filterFacebook") },
    { value: "api", label: t("analytics.chat.recent.filterApi") },
  ];

  const filteredTurns =
    channelFilter === "all"
      ? turns
      : turns.filter((turn) => turn.channel === channelFilter);

  return (
    <Card variant="flat" className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <CardTitle className="text-lg font-semibold text-foreground">
              {t("analytics.chat.recent.title")}
            </CardTitle>
            {isSample && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-mini ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]">
                <FlaskConical className="size-3" />
                {t("analytics.chat.recent.sampleBadge")}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t("analytics.chat.recent.subtitle")}
          </p>
        </div>

        <SegmentedTabs
          options={filterOptions}
          value={channelFilter}
          onChange={setChannelFilter}
          ariaLabel={t("analytics.chat.recent.title")}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={channelFilter}
          initial={prefersReduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
          className="mt-5"
        >
          {filteredTurns.length === 0 ? (
            <p className="border-t py-8 text-center text-sm text-muted-foreground">
              {t("analytics.chat.recent.empty")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b text-xs font-medium text-muted-foreground">
                    <th className="py-2.5 pr-4 font-medium">
                      {t("analytics.chat.recent.colTime")}
                    </th>
                    <th className="py-2.5 pr-4 font-medium">
                      {t("analytics.chat.recent.colChannel")}
                    </th>
                    <th className="py-2.5 pr-4 font-medium">
                      {t("analytics.chat.recent.colResponder")}
                    </th>
                    <th className="py-2.5 pr-4 font-medium">
                      {t("analytics.chat.recent.colType")}
                    </th>
                    <th className="py-2.5 text-right font-medium">
                      {t("analytics.chat.recent.colStatus")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTurns.map((turn) => (
                    <tr
                      key={turn.id}
                      className="border-b border-black/5 transition-colors duration-200 hover:bg-accent/40 dark:border-white/5"
                    >
                      <td className="py-3.5 pr-4 font-mono text-xs tabular-nums text-muted-foreground">
                        {formatTurnTime(turn.createdAt)}
                      </td>
                      <td className="py-3.5 pr-4 text-[13px] text-normal">
                        {turn.channel ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`size-2 rounded-full ${CHANNEL_DOT[turn.channel]}`}
                            />
                            {t(`analytics.chat.channels.items.${turn.channel}`)}
                          </span>
                        ) : (
                          t("analytics.chat.recent.unknown")
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-[13px] text-foreground">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {turn.respondedBy === "AI" ? (
                            <>
                              <Bot className="size-3.5 text-[#5048e4] dark:text-[#a5b4fc]" />
                              {t("analytics.chat.recent.ai")}
                            </>
                          ) : (
                            <>
                              <UserRound className="size-3.5 text-[#ea580c]" />
                              {turn.adminUsername ??
                                t("analytics.chat.recent.admin")}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-[13px] text-normal">
                        {turn.answerType ?? "—"}
                      </td>
                      <td className="py-3.5 text-right">
                        {turn.status === "success" ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#15803d] dark:text-green-400">
                            <CheckCircle2 className="size-3.5" />
                            {t("analytics.chat.recent.statusSuccess")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-red-600 dark:text-red-400">
                            <XCircle className="size-3.5" />
                            {t("analytics.chat.recent.statusFailed")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

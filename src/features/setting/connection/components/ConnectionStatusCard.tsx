import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Clock, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DotBadge } from "@/components/common/DotBadge";
import { formatDate, formatTime } from "@/i18n/format";
import type { ConnectionStatus, LineChannelState } from "../type";
import { StatusVisual } from "./StatusVisual";

type Props = {
  status: ConnectionStatus;
  loading: boolean;
  state: LineChannelState | undefined;
  celebrate: boolean;
  errorMessage: string | null;
  webhookReady: boolean;
};

const DetailRow = ({
  icon: Icon,
  children,
}: {
  icon: typeof Bot;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2.5 text-sm text-normal">
    <Icon className="size-4 shrink-0 text-mini" />
    <span className="min-w-0 truncate">{children}</span>
  </div>
);

export const ConnectionStatusCard = ({
  status,
  loading,
  state,
  celebrate,
  errorMessage,
  webhookReady,
}: Props) => {
  const { t } = useTranslation("settings");
  const reduceMotion = useReducedMotion();

  const description =
    status === "failed" && errorMessage
      ? errorMessage
      : t(
          status === "connected" && state?.source === "env"
            ? "connection.status.connected.envDescription"
            : `connection.status.${status}.description`
        );

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-normal">{t("connection.status.title")}</h2>

      {loading ? (
        <div className="mt-6 flex flex-col items-center gap-3" aria-busy>
          <Skeleton className="size-[72px] rounded-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={status}
            role="status"
            aria-live="polite"
            className="mt-4 flex flex-col items-center gap-3 px-2 pb-2 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <StatusVisual status={status} celebrate={celebrate} />

            <p className="text-base font-semibold text-normal">
              {t(`connection.status.${status}.title`)}
            </p>
            <p className="text-xs leading-relaxed text-mini">{description}</p>

            {status === "failed" && state?.connected && (
              <p className="text-xs text-mini">{t("connection.status.failed.keepsPrevious")}</p>
            )}

            {status === "connected" && state && (
              <motion.ul
                className="mt-2 flex w-full flex-col gap-2.5 rounded-xl bg-hover px-4 py-3 text-left"
                initial={reduceMotion ? false : "hidden"}
                animate="shown"
                variants={{ shown: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
              >
                {[
                  state.displayName && (
                    <DetailRow key="bot" icon={Bot}>
                      {state.displayName}
                      {state.basicId && <span className="ml-1.5 text-mini">{state.basicId}</span>}
                    </DetailRow>
                  ),
                  state.verifiedAt && (
                    <DetailRow key="verified" icon={Clock}>
                      {t("connection.status.connected.verifiedAt", {
                        date: formatDate(state.verifiedAt),
                        time: formatTime(state.verifiedAt),
                      })}
                    </DetailRow>
                  ),
                  <DetailRow key="webhook" icon={Link2}>
                    <DotBadge tone={webhookReady ? "success" : "warning"}>
                      {t(webhookReady ? "connection.webhook.ready" : "connection.webhook.notReady")}
                    </DotBadge>
                  </DetailRow>,
                ]
                  .filter(Boolean)
                  .map((row, index) => (
                    <motion.li
                      key={index}
                      variants={{ hidden: { opacity: 0, x: -8 }, shown: { opacity: 1, x: 0 } }}
                      className="list-none"
                    >
                      {row}
                    </motion.li>
                  ))}
              </motion.ul>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </Card>
  );
};

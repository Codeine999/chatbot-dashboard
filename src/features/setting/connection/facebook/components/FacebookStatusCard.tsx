import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, FileText, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DotBadge } from "@/components/common/DotBadge";
import { formatDate, formatTime } from "@/i18n/format";
import { StatusVisual } from "../../components/StatusVisual";
import type { ConnectionStatus } from "../../type";
import type { FacebookChannelState } from "../type";

type Props = {
  status: ConnectionStatus;
  loading: boolean;
  state: FacebookChannelState | undefined;
  celebrate: boolean;
  errorMessage: string | null;
};

const DetailRow = ({
  icon: Icon,
  children,
}: {
  icon: typeof Clock;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2.5 text-sm text-normal">
    <Icon className="size-4 shrink-0 text-muted-foreground" />
    <span className="min-w-0 truncate">{children}</span>
  </div>
);

export const FacebookStatusCard = ({
  status,
  loading,
  state,
  celebrate,
  errorMessage,
}: Props) => {
  const { t } = useTranslation("settings");
  const reduceMotion = useReducedMotion();
  const base = "connection.facebook.status";
  // subscribe สำเร็จ = Meta ส่งข้อความเข้ามาที่ webhook ได้ (env ไม่มีค่านี้ จึงถือว่าตั้งไว้แล้ว)
  const subscribed = Boolean(state?.webhookSetAt) || state?.source === "env";

  const description =
    status === "failed" && errorMessage
      ? errorMessage
      : t(
          status === "connected" && state?.source === "env"
            ? `${base}.connected.envDescription`
            : `${base}.${status}.description`
        );

  return (
    <Card variant="flat" className="py-8 lg:border-l lg:pl-8">
      <h2 className="text-[15px] font-semibold text-foreground">{t(`${base}.title`)}</h2>

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

            <p className="text-base font-semibold text-foreground">
              {t(`${base}.${status}.title`)}
            </p>
            <p className="text-xs leading-relaxed text-mini">{description}</p>

            {status === "failed" && state?.connected && (
              <p className="text-xs text-mini">{t(`${base}.failed.keepsPrevious`)}</p>
            )}

            {status === "connected" && state && (
              <ul className="mt-2 flex w-full flex-col gap-2.5 rounded-xl bg-muted px-4 py-3 text-left">
                {(state.pageName ?? state.pageId) && (
                  <li className="list-none">
                    <DetailRow icon={FileText}>
                      {state.pageName ?? state.pageId}
                      {state.pageName && state.pageId && (
                        <span className="ml-1.5 text-mini">{state.pageId}</span>
                      )}
                    </DetailRow>
                  </li>
                )}
                {state.verifiedAt && (
                  <li className="list-none">
                    <DetailRow icon={Clock}>
                      {t(`${base}.connected.verifiedAt`, {
                        date: formatDate(state.verifiedAt),
                        time: formatTime(state.verifiedAt),
                      })}
                    </DetailRow>
                  </li>
                )}
                <li className="list-none">
                  <DetailRow icon={Link2}>
                    <DotBadge tone={subscribed ? "success" : "warning"}>
                      {t(
                        subscribed
                          ? "connection.facebook.webhook.ready"
                          : "connection.facebook.webhook.notReady"
                      )}
                    </DotBadge>
                  </DetailRow>
                </li>
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </Card>
  );
};

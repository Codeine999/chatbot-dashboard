import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleX,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTestWebhook, useWebhookHealth } from "../hooks/useLineWebhook";
import { buildWebhookRows, type RowTone } from "../utils/webhookRows";

const TONE_UI: Record<RowTone, { icon: typeof CircleCheck; className: string }> = {
  success: { icon: CircleCheck, className: "text-green-600 dark:text-green-400" },
  warning: { icon: CircleAlert, className: "text-amber-600 dark:text-amber-400" },
  danger: { icon: CircleX, className: "text-red-600 dark:text-red-400" },
  neutral: { icon: CircleDashed, className: "text-mini" },
  loading: { icon: Loader2, className: "animate-spin text-blue-600 dark:text-blue-400" },
};

/** ตรวจ webhook สามชั้น: ตั้งค่าที่ LINE ถูกไหม, LINE ยิงมาถึงเราไหม, มี event จริงเข้ามาไหม */
export const WebhookHealthPanel = ({
  webhookSetAt,
}: {
  /** เวลาที่ทดสอบผ่านล่าสุด (backend จำไว้) */
  webhookSetAt: string | null;
}) => {
  const { t } = useTranslation("settings");
  const reduceMotion = useReducedMotion();
  const health = useWebhookHealth(true);
  const test = useTestWebhook();

  const rows = buildWebhookRows({
    t,
    health: health.data,
    test: test.data,
    testing: test.isPending,
    testedOkAt: webhookSetAt,
    loading: health.isLoading,
  });

  return (
    <div className="mt-5 rounded-xl border bg-card/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-normal">
          {t("connection.webhook.health.title")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={health.isFetching || test.isPending}
            onClick={() => health.refetch()}
          >
            <RefreshCw className={cn(health.isFetching && "animate-spin")} />
            {t("connection.webhook.health.refresh")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={test.isPending}
            onClick={() => test.mutate()}
          >
            {test.isPending ? <Loader2 className="animate-spin" /> : <Zap />}
            {t(
              test.isPending
                ? "connection.webhook.health.testing"
                : "connection.webhook.health.test"
            )}
          </Button>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-3">
        {rows.map((row, index) => {
          const { icon: Icon, className } = TONE_UI[row.tone];
          return (
            <motion.li
              key={row.id}
              className="flex items-start gap-3"
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07, duration: 0.2 }}
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium text-normal">{row.title}</p>
                <p className="mt-0.5 break-words text-xs leading-relaxed text-mini">
                  {row.detail}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

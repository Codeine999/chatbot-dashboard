import { useState } from "react";
import { FlaskConical, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "../hooks/useAnalytics";
import { bucketDelta } from "../lib/format";
import { GRANULARITY_OPTIONS, GRANULARITY_UNIT_KEY, METRICS } from "../lib/metrics";
import type {
  AnalyticsMetric,
  AnalyticsPoint,
  AnalyticsSeries,
  Granularity,
} from "../type/analytics.type";
import { GranularitySelect } from "./GranularitySelect";
import { ChartLegendRow, MetricChart } from "./MetricChart";
import { useTranslation } from "react-i18next";

type Props = {
  metric: AnalyticsMetric;
  defaultGranularity?: Granularity;
  /** flat = หน้า Home: ไม่มีกรอบ ไม่มี icon tile สลับช่วงด้วยแท็บ legend อยู่ข้างตัวเลข */
  variant?: "card" | "flat";
};

/**
 * ป้ายบอกสถานะข้อมูล ถ้าไม่ใช่ข้อมูลจริงต้องบอกด้วยว่าเพราะอะไร
 * จะได้แยกออกว่าเป็นปัญหา auth, ยังไม่มีข้อมูล หรือชื่อฟิลด์จาก API ไม่ตรงกับที่ map ไว้
 */
function SourceBadge({ data }: { data: AnalyticsSeries }) {
  const { t } = useTranslation("usage");

  // ข้อมูลจริงแต่แยกฟิลด์ได้ไม่ครบ ตัวเลขจะต่ำกว่าความจริง ต้องเตือนไว้
  if (!data.isSample) {
    if (!data.isPartial) return null;

    return (
      <span
        title={t("badge.partialHint")}
        className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
      >
        <TriangleAlert className="size-3" />
        {t("badge.partial")}
      </span>
    );
  }

  const { label, hint, warn } = {
    error: {
      label: t("badge.apiError"),
      // errorMessage มาจาก backend ใช้ตามที่ส่งมา ถ้าไม่มีค่อยใช้ข้อความของเราเอง
      hint: data.errorMessage ?? t("badge.apiErrorHint"),
      warn: true,
    },
    shape: {
      label: t("badge.unmapped"),
      hint: t("badge.unmappedHint", { count: data.rowCount }),
      warn: true,
    },
    empty: {
      label: t("badge.sample"),
      hint: t("badge.sampleHint"),
      warn: false,
    },
  }[data.sampleReason ?? "empty"];

  const Icon = warn ? TriangleAlert : FlaskConical;

  return (
    <span
      title={hint}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        warn
          ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
          : "bg-muted text-mini ring-black/[0.04] dark:ring-white/[0.06]"
      }`}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

/** ยังไม่มี API ส่งสัดส่วนนี้ ใช้ค่าตัวอย่างไปก่อนจนกว่า backend จะมี */
const HANDOFF_STATS = { aiPercent: 87, adminPercent: 13, avgResponseSec: 2.4 };

/** แถบสรุปการตอบของ AI เทียบกับแอดมิน ต่อจากกราฟปริมาณแชท */
function ChatHandoffStats() {
  const { t } = useTranslation("usage");
  const { aiPercent, adminPercent, avgResponseSec } = HANDOFF_STATS;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      <div>
        <p className="text-xs text-mini">{t("handoff.aiHandled")}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-base font-semibold tabular-nums text-normal">{aiPercent}%</p>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${aiPercent}%` }} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-mini">{t("handoff.toAdmin")}</p>
        <p className="mt-1 text-base font-semibold tabular-nums text-normal">{adminPercent}%</p>
      </div>
      <div>
        <p className="text-xs text-mini">{t("handoff.avgResponse")}</p>
        <p className="mt-1 text-base font-semibold tabular-nums text-normal">
          {avgResponseSec.toFixed(1)} <span className="text-xs font-medium text-mini">{t("handoff.seconds")}</span>
        </p>
      </div>
    </div>
  );
}

function DeltaBadge({
  points,
  granularity,
}: {
  points: AnalyticsPoint[];
  granularity: Granularity;
}) {
  const { t } = useTranslation("usage");
  const delta = bucketDelta(points);
  if (!delta) return null;

  const isUp = delta.percent >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-normal ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]">
      <Icon
        className={`size-3.5 ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}`}
        strokeWidth={2.4}
      />
      {isUp ? "+" : ""}
      {delta.percent.toFixed(1)}%
      <span className="font-medium text-mini">
        {t("chart.vsPrev", { unit: t(GRANULARITY_UNIT_KEY[granularity]) })}
      </span>
    </span>
  );
}

/**
 * กราฟหนึ่งใบต่อหนึ่ง endpoint สลับช่วงเวลาได้ในตัวเองด้วย dropdown มุมขวาบน
 */
export const MetricCard = ({ metric: metricId, defaultGranularity = "day", variant = "card" }: Props) => {
  const { t } = useTranslation("usage");
  const [granularity, setGranularity] = useState<Granularity>(defaultGranularity);

  const metric = METRICS[metricId];
  const { data, isPending, isFetching } = useAnalytics(metricId, granularity);

  const points = data?.points ?? [];
  const windowKey =
    GRANULARITY_OPTIONS.find((option) => option.value === granularity)?.windowKey ?? "";
  const window = windowKey ? t(windowKey) : "";
  const Icon = metric.icon;
  const flat = variant === "flat";

  return (
    <Card variant={flat ? "flat" : "default"} className={flat ? "flex flex-col gap-5" : "flex flex-col gap-5 p-5 sm:p-6"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {!flat && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-normal ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]">
              <Icon className="size-[18px]" strokeWidth={2.1} />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className={flat ? "text-lg font-semibold text-foreground" : "text-sm font-semibold tracking-tight text-normal"}>
                {t(metric.titleKey)}
              </p>
              {flat && data && <SourceBadge data={data} />}
            </div>
            <p className={flat ? "mt-1 text-[13px] text-muted-foreground" : "mt-1.5 text-xs text-mini"}>
              {t(metric.descriptionKey)} · {window}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!flat && data && <SourceBadge data={data} />}
          <GranularitySelect value={granularity} onChange={setGranularity} variant={flat ? "tabs" : "select"} />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        {isPending ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <>
            <p className={flat ? "text-4xl font-semibold tracking-[-0.03em] text-foreground tabular-nums" : "text-3xl font-semibold tracking-[-0.04em] text-normal tabular-nums"}>
              {metric.formatValue(data?.headline ?? 0)}
            </p>
            <p className="pb-1.5 text-xs font-medium text-mini">{t(metric.unitKey)}</p>
            {flat && metric.series.length > 1 && (
              <ChartLegendRow metric={metric} className="ml-auto justify-end pb-1.5" />
            )}
            {metric.showDelta !== false && (
              <div className={flat ? "pb-1" : "ml-auto pb-1"}>
                <DeltaBadge points={points} granularity={granularity} />
              </div>
            )}
          </>
        )}
      </div>

      {isPending ? (
        <Skeleton className="h-[190px] w-full rounded-xl" />
      ) : (
        <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <MetricChart metric={metric} points={points} showLegend={!flat} />
        </div>
      )}

      {metricId === "chat" && !isPending && <ChatHandoffStats />}
    </Card>
  );
};

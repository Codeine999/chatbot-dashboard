import { CreditCard, MessageSquare, Users, Wallet, type LucideIcon } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { formatBahtCompact, formatBahtFull, formatCompact, formatFull } from "./format";
import type { AnalyticsMetric, Granularity } from "../type/analytics.type";

export type SeriesDef = {
  key: string;
  /** key ใน namespace "usage" ไม่ใช่ข้อความจริง แปลตอน render */
  labelKey: string;
  color: string;
  /** ค่า type จาก API หรือชื่อฟิลด์ตัวเลข ที่ให้นับเข้า series นี้ */
  aliases: string[];
};

export type MetricDef = {
  id: AnalyticsMetric;
  endpoint: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  form: "bar" | "line";
  series: SeriesDef[];
  /** ยอดบนหัวการ์ด metric ที่เป็น "ระดับ" ใช้ค่าล่าสุด ไม่ใช่ผลรวม */
  aggregate: "sum" | "latest";
  unitKey: string;
  formatValue: (value: number) => string;
  formatAxis: (value: number) => string;
};

/**
 * กราฟที่มี series เดียวไม่ต้องใช้สีแยกอะไร ใช้สีเน้นสีเดียวทั้งใบ
 * เหลือแค่ credit usage ใบเดียวที่ต้องใช้หลายสี เพราะสีคือตัวบอกประเภท credit
 */
const ACCENT = "var(--chart-accent)";

export const METRICS: Record<AnalyticsMetric, MetricDef> = {
  chat: {
    id: "chat",
    endpoint: "/admin/analytics/chat",
    titleKey: "metric.chat.title",
    descriptionKey: "metric.chat.description",
    icon: MessageSquare,
    form: "bar",
    aggregate: "sum",
    unitKey: "metric.chat.unit",
    formatValue: formatFull,
    formatAxis: formatCompact,
    series: [
      {
        key: "messages",
        labelKey: "metric.chat.series.messages",
        color: ACCENT,
        aliases: ["messages", "message", "count", "volume", "value", "total"],
      },
    ],
  },

  creditUsage: {
    id: "creditUsage",
    endpoint: "/admin/analytics/credit-usage",
    titleKey: "metric.creditUsage.title",
    descriptionKey: "metric.creditUsage.description",
    icon: CreditCard,
    form: "bar",
    aggregate: "sum",
    unitKey: "metric.creditUsage.unit",
    formatValue: formatFull,
    formatAxis: formatCompact,
    series: [
      {
        key: "aiChat",
        labelKey: "metric.creditUsage.series.aiChat",
        color: "var(--token-ai)",
        aliases: ["AI_CHAT", "AI_REPLY", "AI"],
      },
      {
        key: "lineSend",
        labelKey: "metric.creditUsage.series.lineSend",
        color: "var(--token-line)",
        aliases: ["LINE_SEND", "LINE_MESSAG", "LINE"],
      },
      {
        key: "admin",
        labelKey: "metric.creditUsage.series.admin",
        color: "var(--token-admin)",
        aliases: ["ADMIN"],
      },
    ],
  },

  followers: {
    id: "followers",
    endpoint: "/admin/analytics/followers",
    titleKey: "metric.followers.title",
    descriptionKey: "metric.followers.description",
    icon: Users,
    form: "line",
    aggregate: "latest",
    unitKey: "metric.followers.unit",
    formatValue: formatFull,
    formatAxis: formatCompact,
    series: [
      {
        key: "followers",
        labelKey: "metric.followers.series.followers",
        color: ACCENT,
        aliases: ["followers", "followerCount", "follower", "level", "count", "value", "total"],
      },
    ],
  },

  revenue: {
    id: "revenue",
    endpoint: "/admin/analytics/revenue",
    titleKey: "metric.revenue.title",
    descriptionKey: "metric.revenue.description",
    icon: Wallet,
    form: "bar",
    aggregate: "sum",
    unitKey: "metric.revenue.unit",
    formatValue: formatBahtFull,
    formatAxis: formatBahtCompact,
    series: [
      {
        key: "revenue",
        labelKey: "metric.revenue.series.revenue",
        color: ACCENT,
        aliases: ["revenue", "amount", "paidAmount", "sum", "value", "total"],
      },
    ],
  },
};

export const METRIC_ORDER: AnalyticsMetric[] = ["creditUsage", "chat", "followers", "revenue"];

export const GRANULARITY_OPTIONS: Array<{
  value: Granularity;
  labelKey: string;
  windowKey: string;
}> = [
  { value: "hour", labelKey: "granularity.hour", windowKey: "granularity.window.hour" },
  { value: "day", labelKey: "granularity.day", windowKey: "granularity.window.day" },
  { value: "month", labelKey: "granularity.month", windowKey: "granularity.window.month" },
  { value: "year", labelKey: "granularity.year", windowKey: "granularity.window.year" },
];

export const GRANULARITY_UNIT_KEY: Record<Granularity, string> = {
  hour: "granularity.unit.hour",
  day: "granularity.unit.day",
  month: "granularity.unit.month",
  year: "granularity.unit.year",
};

/** ต้องรับ t เข้ามา เพราะ ChartConfig เก็บข้อความที่แสดงจริงใน tooltip ไม่ใช่ key */
export const buildChartConfig = (
  metric: MetricDef,
  t: (key: string) => string
): ChartConfig =>
  Object.fromEntries(
    metric.series.map(({ key, labelKey, color }) => [
      key,
      { label: t(labelKey), color },
    ])
  );

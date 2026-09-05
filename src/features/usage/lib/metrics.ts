import { CreditCard, MessageSquare, Users, Wallet, type LucideIcon } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { formatBahtCompact, formatBahtFull, formatCompact, formatFull } from "./format";
import type { AnalyticsMetric, Granularity } from "../type/analytics.type";

export type SeriesDef = {
  key: string;
  label: string;
  color: string;
  /** ค่า type จาก API หรือชื่อฟิลด์ตัวเลข ที่ให้นับเข้า series นี้ */
  aliases: string[];
};

export type MetricDef = {
  id: AnalyticsMetric;
  endpoint: string;
  title: string;
  description: string;
  icon: LucideIcon;
  form: "bar" | "line";
  series: SeriesDef[];
  /** ยอดบนหัวการ์ด metric ที่เป็น "ระดับ" ใช้ค่าล่าสุด ไม่ใช่ผลรวม */
  aggregate: "sum" | "latest";
  unit: string;
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
    title: "Chat volume",
    description: "LINE messages handled",
    icon: MessageSquare,
    form: "bar",
    aggregate: "sum",
    unit: "messages",
    formatValue: formatFull,
    formatAxis: formatCompact,
    series: [
      {
        key: "messages",
        label: "Messages",
        color: ACCENT,
        aliases: ["messages", "message", "count", "volume", "value", "total"],
      },
    ],
  },

  creditUsage: {
    id: "creditUsage",
    endpoint: "/admin/analytics/credit-usage",
    title: "Token spending",
    description: "Credits burned by type",
    icon: CreditCard,
    form: "bar",
    aggregate: "sum",
    unit: "tokens",
    formatValue: formatFull,
    formatAxis: formatCompact,
    series: [
      {
        key: "aiChat",
        label: "AI chat",
        color: "var(--token-ai)",
        aliases: ["AI_CHAT", "AI_REPLY", "AI"],
      },
      {
        key: "lineSend",
        label: "LINE send",
        color: "var(--token-line)",
        aliases: ["LINE_SEND", "LINE_MESSAG", "LINE"],
      },
      {
        key: "admin",
        label: "Admin tools",
        color: "var(--token-admin)",
        aliases: ["ADMIN"],
      },
    ],
  },

  followers: {
    id: "followers",
    endpoint: "/admin/analytics/followers",
    title: "LINE followers",
    description: "Follower level per bucket",
    icon: Users,
    form: "line",
    aggregate: "latest",
    unit: "followers",
    formatValue: formatFull,
    formatAxis: formatCompact,
    series: [
      {
        key: "followers",
        label: "Followers",
        color: ACCENT,
        aliases: ["followers", "followerCount", "follower", "level", "count", "value", "total"],
      },
    ],
  },

  revenue: {
    id: "revenue",
    endpoint: "/admin/analytics/revenue",
    title: "Revenue",
    description: "Successful customer payments",
    icon: Wallet,
    form: "bar",
    aggregate: "sum",
    unit: "paid",
    formatValue: formatBahtFull,
    formatAxis: formatBahtCompact,
    series: [
      {
        key: "revenue",
        label: "Revenue",
        color: ACCENT,
        aliases: ["revenue", "amount", "paidAmount", "sum", "value", "total"],
      },
    ],
  },
};

export const METRIC_ORDER: AnalyticsMetric[] = ["creditUsage", "chat", "followers", "revenue"];

export const GRANULARITY_OPTIONS: Array<{ value: Granularity; label: string; window: string }> = [
  { value: "hour", label: "Hourly", window: "Last 24 hours" },
  { value: "day", label: "Daily", window: "Last 30 days" },
  { value: "month", label: "Monthly", window: "Last 12 months" },
  { value: "year", label: "Yearly", window: "Last 5 years" },
];

export const GRANULARITY_UNIT: Record<Granularity, string> = {
  hour: "hour",
  day: "day",
  month: "month",
  year: "year",
};

export const buildChartConfig = (metric: MetricDef): ChartConfig =>
  Object.fromEntries(
    metric.series.map(({ key, label, color }) => [key, { label, color }])
  );

/** เว้นร่องบาง ๆ ระหว่างชั้นที่ซ้อนกัน ให้แยกชั้นออกจากกันได้แม้สีใกล้กัน */
export const STACK_GAP = {
  stroke: "var(--chart-surface)",
  strokeWidth: 2,
} as const;

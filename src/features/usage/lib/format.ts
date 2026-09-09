import { formatNumber } from "@/i18n/format";
import type { AnalyticsPoint } from "../type/analytics.type";

/** ย่อเลขบนแกนและป้ายในกราฟ */
export const formatCompact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(value));
};

export const formatFull = (value: number) => formatNumber(Math.round(value));

export const formatBahtCompact = (value: number) => `฿${formatCompact(value)}`;

export const formatBahtFull = (value: number) =>
  `฿${formatNumber(Math.round(value))}`;

/**
 * เทียบ bucket ล่าสุดที่จบแล้วกับ bucket ก่อนหน้า
 * ไม่นับ bucket ปัจจุบันเพราะยังเก็บข้อมูลไม่ครบ ตัวเลขจะดูตกเสมอ
 */
export const bucketDelta = (points: AnalyticsPoint[]) => {
  if (points.length < 3) return null;

  const current = points[points.length - 2].total;
  const previous = points[points.length - 3].total;

  if (previous <= 0) return null;

  return { current, previous, percent: ((current - previous) / previous) * 100 };
};

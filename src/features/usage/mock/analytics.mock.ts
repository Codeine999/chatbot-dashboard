import { buildBucketRange } from "../lib/timeBucket";
import type { MetricDef } from "../lib/metrics";
import type { AnalyticsMetric, AnalyticsPoint, Granularity } from "../type/analytics.type";

/**
 * ตัวเลข pseudo-random ที่ผูกกับ seed (0..1)
 * ใช้ให้ค่า mock คงที่ทุกครั้งที่ re-render กราฟจะได้ไม่กระตุก
 */
const seeded = (seed: string) => {
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return ((hash >>> 0) % 1000) / 1000;
};

/** โค้งการใช้งานในหนึ่งวัน พีคช่วงเวลาทำการ */
const hourWeight = (hour: number) => 0.15 + 0.85 * Math.exp(-((hour - 13) ** 2) / 26);

/** เสาร์อาทิตย์ทราฟฟิกต่ำกว่าวันทำงาน */
const weekdayWeight = (day: number) => (day === 0 || day === 6 ? 0.45 : 1);

/** ขนาดตั้งต้นต่อหนึ่ง bucket ของแต่ละ metric */
const BASE: Record<AnalyticsMetric, Record<Granularity, number>> = {
  chat: { hour: 180, day: 3_200, month: 92_000, year: 1_050_000 },
  creditUsage: { hour: 4_200, day: 68_000, month: 1_850_000, year: 19_500_000 },
  followers: { hour: 4_200, day: 4_400, month: 5_100, year: 6_800 },
  revenue: { hour: 900, day: 18_000, month: 520_000, year: 6_200_000 },
};

/** สัดส่วนของแต่ละ series เมื่อ metric มีมากกว่าหนึ่งเส้น */
const SPLIT = [0.56, 0.31, 0.13];

/**
 * ข้อมูลสำรองรูปทรงเหมือนของจริง ใช้เฉพาะตอน API ยังไม่พร้อม
 * และหน้าจอจะติดป้าย "Sample data" กำกับไว้เสมอ
 */
export const buildAnalyticsMock = (
  metric: MetricDef,
  granularity: Granularity,
  now = new Date()
): AnalyticsPoint[] => {
  const range = buildBucketRange(granularity, now);
  const base = BASE[metric.id][granularity];
  const isLevel = metric.aggregate === "latest";

  return range.map(({ date, bucket, label, fullLabel }, index) => {
    const noise = 0.7 + seeded(`${metric.id}:${bucket}`) * 0.6;
    const progress = index / Math.max(range.length - 1, 1);

    const shape =
      granularity === "hour"
        ? hourWeight(date.getHours())
        : granularity === "day"
          ? weekdayWeight(date.getDay())
          : 1;

    // metric ที่เป็น "ระดับ" ต้องไต่ขึ้นเรื่อย ๆ ไม่ใช่เด้งขึ้นลงแบบยอดต่อรอบ
    const total = isLevel
      ? Math.round(base * (1 + progress * 0.38) * (0.97 + seeded(`lvl:${bucket}`) * 0.06))
      : Math.round(base * shape * noise * (1 + progress * (granularity === "hour" ? 0 : 0.5)));

    const point: AnalyticsPoint = { bucket, label, fullLabel, total: 0 };
    let remaining = total;

    metric.series.forEach((series, seriesIndex) => {
      const isLast = seriesIndex === metric.series.length - 1;
      const share = isLast
        ? remaining
        : Math.round(total * (SPLIT[seriesIndex] ?? 1) * (0.9 + seeded(`${series.key}:${bucket}`) * 0.2));

      point[series.key] = Math.max(isLast ? remaining : share, 0);
      remaining -= share;
    });

    point.total = metric.series.reduce((sum, { key }) => sum + (point[key] as number), 0);

    return point;
  });
};

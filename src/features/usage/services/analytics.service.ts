import { api, getApiErrorMessage } from "@/api/api";
import { buildAnalyticsMock } from "../mock/analytics.mock";
import { METRICS, type MetricDef } from "../lib/metrics";
import { buildBucketRange, toBucketKey } from "../lib/timeBucket";
import type {
  AnalyticsMetric,
  AnalyticsPoint,
  AnalyticsSeries,
  ChatActivityResponse,
  CreditUsageResponse,
  FollowersResponse,
  Granularity,
  RevenueResponse,
  SampleReason,
} from "../type/analytics.type";

/**
 * ทุกกราฟดึงจาก `/api/admin/analytics/*` ซึ่ง backend คืน bucket มาแน่นอยู่แล้ว
 * (LEFT JOIN กับแกนเวลาใน SQL) ช่วงที่ไม่มีข้อมูลจึงมาเป็นศูนย์ ไม่ได้หายไป
 *
 * response ของแต่ละเส้นมีโครงต่างกัน และ credit-usage ซ้อนเป็น object ต่อหมวด
 * จึงแปลงด้วย mapper ที่เขียนตาม contract ตรง ๆ แทนการเดาชื่อฟิลด์
 */

const pad = (value: number) => String(value).padStart(2, "0");

/** backend รับ from/to เป็นวันที่ล้วน และตัด bucket ด้วย UTC */
const toApiDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * timestamp ที่ backend ส่งมามีสี่รูปแบบตาม interval
 * ค่าที่เป็นวันที่ล้วนต้องอ่านเป็นเวลาท้องถิ่น ไม่งั้น bucket จะเลื่อนไปหนึ่งช่อง
 */
const parseTimestamp = (raw: string): Date | null => {
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));

  const ym = raw.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, 1);

  const year = raw.match(/^(\d{4})$/);
  if (year) return new Date(Number(year[1]), 0, 1);

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toNumber = (value: string | number | null | undefined) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
};

/** ค่าของหนึ่ง bucket แยกตาม series key ของ metric นั้น */
type BucketValues = Record<string, number>;

/**
 * ประกอบจุดบนกราฟจากแกนเวลาที่หน้าจอกำหนด + ค่าที่ backend ส่งมา
 * แกนสร้างจากฝั่งเราเสมอ เพื่อให้จำนวนช่องเท่ากับที่ dropdown เลือกไว้
 * ถึงแม้ backend จะคืนช่วงกว้างหรือแคบกว่า
 */
const buildPoints = (
  metric: MetricDef,
  granularity: Granularity,
  now: Date,
  byBucket: Map<string, BucketValues>,
  options: { carryForward?: boolean } = {}
): { points: AnalyticsPoint[]; matched: number } => {
  const keys = metric.series.map((series) => series.key);
  let carried: BucketValues | null = null;
  let matched = 0;

  const points = buildBucketRange(granularity, now).map((slot) => {
    const found = byBucket.get(slot.bucket);
    if (found) matched += 1;

    // followers เป็น "ระดับ" ไม่ใช่ผลรวม วันที่ไม่มี snapshot จึงใช้ค่าก่อนหน้าต่อ
    // ไม่งั้นเส้นจะดิ่งลงศูนย์ทั้งที่ผู้ติดตามไม่ได้หายไปไหน
    const values = found ?? (options.carryForward ? carried : null);
    if (found) carried = found;

    const point: AnalyticsPoint = {
      bucket: slot.bucket,
      label: slot.label,
      fullLabel: slot.fullLabel,
      total: 0,
    };

    let total = 0;
    for (const key of keys) {
      const value = values?.[key] ?? 0;
      point[key] = value;
      total += value;
    }
    point.total = total;

    return point;
  });

  return { points, matched };
};

/** จัดค่าลง bucket ตามเวลาท้องถิ่น ใช้ร่วมกันทุก metric */
const indexByBucket = <TRow extends { timestamp: string }>(
  rows: TRow[],
  granularity: Granularity,
  toValues: (row: TRow) => BucketValues
) => {
  const byBucket = new Map<string, BucketValues>();

  for (const row of rows) {
    const date = parseTimestamp(row.timestamp);
    if (!date) continue;
    byBucket.set(toBucketKey(date, granularity), toValues(row));
  }

  return byBucket;
};

type Fetched = {
  byBucket: Map<string, BucketValues>;
  rowCount: number;
  carryForward?: boolean;
};

const FETCHERS: Record<
  AnalyticsMetric,
  (params: Record<string, string>, granularity: Granularity) => Promise<Fetched>
> = {
  chat: async (params, granularity) => {
    const { data } = await api.get<ChatActivityResponse>(
      METRICS.chat.endpoint,
      { params }
    );
    const rows = data?.series ?? [];

    return {
      rowCount: rows.length,
      byBucket: indexByBucket(rows, granularity, (row) => ({
        user: toNumber(row.user),
        ai: toNumber(row.ai),
        admin: toNumber(row.admin),
      })),
    };
  },

  creditUsage: async (params, granularity) => {
    const { data } = await api.get<CreditUsageResponse>(
      METRICS.creditUsage.endpoint,
      { params }
    );
    const rows = data?.series ?? [];

    /*
     * ใช้ chargedCredit ไม่ใช่ totalTokens เพราะ UsageKind.LINE_PUSH_MESSAGE
     * คิดเป็นค่าส่งข้อความ ไม่มี token เลย ถ้าวัดด้วย token เส้น LINE send
     * จะเป็นศูนย์ตลอด ทั้งที่หักเครดิตไปจริง
     */
    return {
      rowCount: rows.length,
      byBucket: indexByBucket(rows, granularity, (row) => ({
        aiChat: toNumber(row.aiUsage?.chargedCredit),
        lineSend: toNumber(row.lineMessage?.chargedCredit),
        admin: toNumber(row.adminAiQuery?.chargedCredit),
      })),
    };
  },

  followers: async (params, granularity) => {
    const { data } = await api.get<FollowersResponse>(
      METRICS.followers.endpoint,
      { params }
    );
    const rows = (data?.series ?? []).filter((row) => row.followerCount !== null);

    return {
      rowCount: data?.series?.length ?? 0,
      carryForward: true,
      byBucket: indexByBucket(rows, granularity, (row) => ({
        followers: toNumber(row.followerCount),
      })),
    };
  },

  revenue: async (params, granularity) => {
    const { data } = await api.get<RevenueResponse>(
      METRICS.revenue.endpoint,
      { params }
    );
    const rows = data?.series ?? [];

    return {
      rowCount: rows.length,
      byBucket: indexByBucket(rows, granularity, (row) => ({
        revenue: toNumber(row.amount),
      })),
    };
  },
};

const headlineOf = (metric: MetricDef, points: AnalyticsPoint[]) =>
  metric.aggregate === "latest"
    ? (points[points.length - 1]?.total ?? 0)
    : points.reduce((sum, point) => sum + point.total, 0);

export const analyticsApi = {
  /**
   * ดึงข้อมูลกราฟหนึ่งใบตาม metric และช่วงเวลาที่เลือก
   * ถ้ายิงไม่ผ่านจะคืนชุดตัวอย่างพร้อมบอกเหตุผล เพื่อให้แยกออกว่าเป็นปัญหา
   * การเชื่อมต่อ ไม่ใช่ว่าไม่มีข้อมูล
   */
  getSeries: async (
    metricId: AnalyticsMetric,
    granularity: Granularity,
    now = new Date()
  ): Promise<AnalyticsSeries> => {
    const metric = METRICS[metricId];
    const range = buildBucketRange(granularity, now);
    const params = {
      interval: granularity,
      from: toApiDate(range[0].date),
      to: toApiDate(range[range.length - 1].date),
    };

    try {
      const { byBucket, rowCount, carryForward } = await FETCHERS[metricId](
        params,
        granularity
      );
      const { points, matched } = buildPoints(metric, granularity, now, byBucket, {
        carryForward,
      });

      if (matched > 0) {
        return {
          metric: metricId,
          granularity,
          points,
          headline: headlineOf(metric, points),
          isSample: false,
          rowCount,
        };
      }

      // ยิงผ่านแต่ไม่มี bucket ไหนตรงกับแกนเวลาที่แสดงอยู่
      const sample = buildAnalyticsMock(metric, granularity, now);

      return {
        metric: metricId,
        granularity,
        points: sample,
        headline: headlineOf(metric, sample),
        isSample: true,
        sampleReason: (rowCount > 0 ? "shape" : "empty") satisfies SampleReason,
        rowCount,
      };
    } catch (error) {
      const sample = buildAnalyticsMock(metric, granularity, now);

      return {
        metric: metricId,
        granularity,
        points: sample,
        headline: headlineOf(metric, sample),
        isSample: true,
        sampleReason: "error",
        rowCount: 0,
        errorMessage: getApiErrorMessage(error, "Request failed"),
      };
    }
  },
};

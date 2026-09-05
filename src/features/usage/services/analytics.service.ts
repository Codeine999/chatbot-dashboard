import { api, getApiErrorMessage } from "@/api/api";
import { normalize, unwrapRows } from "../lib/normalize";
import { METRICS, type MetricDef } from "../lib/metrics";
import { buildAnalyticsMock } from "../mock/analytics.mock";
import type {
  AnalyticsMetric,
  AnalyticsPoint,
  AnalyticsSeries,
  Granularity,
  SampleReason,
} from "../type/analytics.type";

const headlineOf = (metric: MetricDef, points: AnalyticsPoint[]) =>
  metric.aggregate === "latest"
    ? (points[points.length - 1]?.total ?? 0)
    : points.reduce((sum, point) => sum + point.total, 0);

export const analyticsApi = {
  /**
   * ดึงข้อมูลกราฟหนึ่งใบตาม metric และช่วงเวลาที่เลือก
   * ถ้ายังไม่ได้ข้อมูลจริงจะคืนชุดตัวอย่างพร้อมบอกเหตุผลไว้ด้วย
   * เพื่อให้แยกออกว่า "ยิงไม่ผ่าน" กับ "ยังไม่มีข้อมูล" กับ "ชื่อฟิลด์ไม่ตรง" คนละเรื่องกัน
   */
  getSeries: async (
    metricId: AnalyticsMetric,
    granularity: Granularity,
    now = new Date()
  ): Promise<AnalyticsSeries> => {
    const metric = METRICS[metricId];

    let points: AnalyticsPoint[] = [];
    let rowCount = 0;
    let matched = 0;
    let mismatched = 0;
    let errorMessage: string | undefined;

    try {
      // ยังไม่ส่ง query param ใด ๆ จนกว่าจะรู้ชื่อฟิลด์ที่ DTO ฝั่ง backend รับจริง
      // ตอนนี้ backend จึงเลือกช่วงเวลาเอง แล้วเรา map ลง bucket ที่ตรงกันเท่าที่มี
      const res = await api.get(metric.endpoint);

      const rows = unwrapRows(res.data);
      rowCount = rows.length;

      const result = normalize(rows, metric, granularity, now);
      points = result.points;
      matched = result.matched;
      mismatched = result.mismatched;
    } catch (error) {
      errorMessage = getApiErrorMessage(error, "Request failed");
    }

    // ศูนย์ที่ backend ส่งมาก็คือข้อมูลจริง ห้ามเอา sample ไปทับ
    if (matched > 0) {
      return {
        metric: metricId,
        granularity,
        points,
        headline: headlineOf(metric, points),
        isSample: false,
        isPartial: mismatched > 0,
        rowCount,
      };
    }

    // มี row กลับมาแต่ map ไม่ติดเลย แปลว่าชื่อฟิลด์ที่ normalizer เดาไว้ไม่ตรงของจริง
    const sampleReason: SampleReason = errorMessage
      ? "error"
      : rowCount > 0
        ? "shape"
        : "empty";


    const sample = buildAnalyticsMock(metric, granularity, now);

    return {
      metric: metricId,
      granularity,
      points: sample,
      headline: headlineOf(metric, sample),
      isSample: true,
      sampleReason,
      rowCount,
      errorMessage,
    };
  },
};

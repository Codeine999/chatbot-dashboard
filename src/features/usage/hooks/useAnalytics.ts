import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { analyticsApi } from "../services/analytics.service";
import type { AnalyticsMetric, Granularity } from "../type/analytics.type";

/** ช่วงที่ละเอียดกว่าขยับบ่อยกว่า จึงรีเฟรชถี่กว่า */
const REFETCH_MS: Record<Granularity, number> = {
  hour: 60_000,
  day: 5 * 60_000,
  month: 15 * 60_000,
  year: 30 * 60_000,
};

export function useAnalytics(metric: AnalyticsMetric, granularity: Granularity) {
  // ป้ายบนแกน x ถูกสร้างพร้อมชุดข้อมูล ไม่ได้แปลตอน render
  // ใส่ภาษาไว้ใน key ด้วย พอสลับภาษาจะได้สร้างชุดใหม่ ชื่อเดือนจึงเปลี่ยนตาม
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ["analytics", metric, granularity, i18n.resolvedLanguage],
    queryFn: () => analyticsApi.getSeries(metric, granularity),
    staleTime: REFETCH_MS[granularity],
    refetchInterval: REFETCH_MS[granularity],
    placeholderData: (previous) => previous,
  });
}

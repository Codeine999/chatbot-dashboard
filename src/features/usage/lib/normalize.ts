import { buildBucketRange, toBucketKey } from "./timeBucket";
import type { AnalyticsPoint, AnalyticsRow, Granularity } from "../type/analytics.type";

/**
 * รูปร่างขั้นต่ำที่ normalize ต้องรู้เกี่ยวกับ metric
 * ตั้งใจไม่ import MetricDef ตรง ๆ ไฟล์นี้จะได้เป็น logic ล้วน ๆ ไม่ลาก react/icon เข้ามา
 */
export type NormalizeTarget = {
  series: Array<{ key: string; aliases: string[] }>;
};

/** ฟิลด์ที่อาจเป็นเวลาของ bucket */
const DATE_FIELDS = [
  "bucket", "date", "period", "timestamp", "createdAt", "at", "time", "day", "hour", "month", "year",
];

/** ฟิลด์ที่อาจเป็นชื่อประเภท เอาไว้แยก series */
const CATEGORY_FIELDS = ["type", "creditType", "category", "kind", "sender", "senderType", "source"];

/** ฟิลด์ที่อาจเป็นตัวเลขของ row ไล่ตามลำดับความน่าจะเป็น */
const VALUE_FIELDS = [
  "tokens", "tokenTotal", "totalTokens", "usedTotal", "credits",
  "messages", "count", "followers", "followerCount",
  "revenue", "paidAmount", "amount", "value", "sum", "total",
];

/**
 * ยุบชื่อฟิลด์ให้เหลือแต่ตัวอักษรและตัวเลขพิมพ์เล็ก
 * จะได้จับ aiChat, ai_chat, AI_CHAT ให้เป็นตัวเดียวกัน เพราะยังไม่รู้ว่า backend ตั้งชื่อแบบไหน
 */
const canon = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

/** ทำดัชนีของ row ครั้งเดียว แล้วค้นด้วยชื่อที่ยุบแล้ว */
const indexRow = (row: AnalyticsRow) => {
  const index = new Map<string, unknown>();

  for (const [key, value] of Object.entries(row)) {
    const canonical = canon(key);
    if (!index.has(canonical)) index.set(canonical, value);
  }

  return index;
};

type RowIndex = ReturnType<typeof indexRow>;

const pick = (index: RowIndex, fields: string[]) => {
  for (const field of fields) {
    const value = index.get(canon(field));
    if (value !== undefined) return value;
  }

  return undefined;
};

const asNumber = (value: unknown) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
};

/** ดึง array ของ row ออกมาจาก response ที่อาจถูกห่อไว้หลายชั้น */
export const unwrapRows = (payload: unknown): AnalyticsRow[] => {
  if (Array.isArray(payload)) return payload as AnalyticsRow[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;

  for (const key of ["data", "items", "buckets", "result", "rows", "series", "usage"]) {
    const value = record[key];
    if (Array.isArray(value)) return value as AnalyticsRow[];
    if (value && typeof value === "object") {
      const nested = unwrapRows(value);
      if (nested.length) return nested;
    }
  }

  return [];
};

/**
 * แปลงค่าเวลาของ row เป็น Date
 * ค่าที่เป็นวันที่ล้วน เช่น "2026-09-01" ต้องอ่านเป็นเวลาท้องถิ่น
 * ถ้าปล่อยให้ new Date() อ่านเอง มันจะตีเป็นเที่ยงคืน UTC แล้ว bucket จะเลื่อนไปหนึ่งวัน
 * สำหรับโซนเวลาที่ติดลบ
 */
const parseBucketDate = (raw: string | number): Date | null => {
  if (typeof raw === "number") {
    // เลขปีล้วน ๆ ไม่ใช่ epoch จึงต้องแยกออกมาก่อน
    if (raw >= 1900 && raw <= 2200) return new Date(raw, 0, 1);
    if (raw < 1_000_000_000) return null;

    const epoch = new Date(raw < 1e12 ? raw * 1000 : raw);
    return Number.isNaN(epoch.getTime()) ? null : epoch;
  }

  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));

  const ym = raw.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, 1);

  const y = raw.match(/^(\d{4})$/);
  if (y) return new Date(Number(y[1]), 0, 1);

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const rowDate = (index: RowIndex) => {
  for (const field of DATE_FIELDS) {
    const raw = index.get(canon(field));
    if (typeof raw !== "string" && typeof raw !== "number") continue;

    const parsed = parseBucketDate(raw);
    if (parsed) return parsed;
  }

  return null;
};

const rowCategory = (index: RowIndex) => {
  for (const field of CATEGORY_FIELDS) {
    const raw = index.get(canon(field));
    if (typeof raw === "string" && raw.trim()) return canon(raw);
  }

  return null;
};

/**
 * ตัวเลขหลักของ row ลองชื่อฟิลด์ที่ series ระบุไว้ก่อน แล้วค่อยไล่ชื่อทั่วไป
 * คืน null เมื่อไม่เจอฟิลด์ที่รู้จักเลย ต่างจากเจอแล้วได้ 0 ซึ่งเป็นข้อมูลจริง
 */
const rowValue = (index: RowIndex, preferred: string[] = []): number | null => {
  for (const field of [...preferred, ...VALUE_FIELDS]) {
    const value = asNumber(index.get(canon(field)));
    if (value !== null) return value;
  }

  return null;
};

/**
 * รวม row ดิบเข้ากับแกนเวลาที่สร้างไว้ล่วงหน้า
 * - metric ที่มี series เดียว: บวกทุก row ที่ตกใน bucket เดียวกัน (เช่น chat ที่แยก row ตาม sender)
 * - metric ที่มีหลาย series: แยกตามฟิลด์ประเภท ถ้าไม่มีก็อ่านจากฟิลด์ตัวเลขที่ชื่อตรงกับ series
 */
export const normalize = (
  rows: AnalyticsRow[],
  metric: NormalizeTarget,
  granularity: Granularity,
  now: Date
): { points: AnalyticsPoint[]; matched: number; mismatched: number } => {
  const points = new Map<string, AnalyticsPoint>();

  for (const { bucket, label, fullLabel } of buildBucketRange(granularity, now)) {
    const blank = Object.fromEntries(metric.series.map(({ key }) => [key, 0]));
    points.set(bucket, { bucket, label, fullLabel, total: 0, ...blank });
  }

  const isSingle = metric.series.length === 1;
  // นับ row ที่ map เข้ากราฟได้จริง ใช้แยก "ไม่มีความเคลื่อนไหว" ออกจาก "อ่านฟิลด์ไม่ออก"
  let matched = 0;
  // row ที่ map ได้บางส่วน คือมี total ของตัวเองแต่ไม่เท่ากับผลรวมที่เราแยกได้
  // แปลว่าเดาชื่อฟิลด์ไม่ครบ ต้องเตือน ไม่ใช่โชว์ตัวเลขที่ขาดไปเฉย ๆ
  let mismatched = 0;

  for (const row of rows) {
    const index = indexRow(row);
    const date = rowDate(index);
    if (!date) continue;

    const point = points.get(toBucketKey(date, granularity));
    if (!point) continue;

    if (isSingle) {
      const [series] = metric.series;
      const value = rowValue(index, series.aliases);
      if (value === null) continue;

      point[series.key] = (point[series.key] as number) + value;
      matched += 1;
      continue;
    }

    const category = rowCategory(index);
    const matchedSeries = category
      ? metric.series.find(({ aliases }) =>
          aliases.some((alias) => category.startsWith(canon(alias)))
        )
      : null;

    if (matchedSeries) {
      const value = rowValue(index, matchedSeries.aliases);
      if (value === null) continue;

      point[matchedSeries.key] = (point[matchedSeries.key] as number) + value;
      matched += 1;
      continue;
    }

    let hit = false;
    let rowSum = 0;

    for (const series of metric.series) {
      // ชื่อ series เองก่อน แล้วค่อยลอง alias ในฐานะ "ชื่อฟิลด์" เผื่อ backend แตกคอลัมน์ไว้
      const value = asNumber(pick(index, [series.key, ...series.aliases]));
      if (value === null) continue;

      point[series.key] = (point[series.key] as number) + value;
      rowSum += value;
      hit = true;
    }

    if (!hit) continue;

    matched += 1;

    const declared = asNumber(pick(index, ["total", "tokens", "sum"]));
    if (declared !== null && Math.round(declared) !== Math.round(rowSum)) mismatched += 1;
  }

  const merged = [...points.values()].map((point) => ({
    ...point,
    total: metric.series.reduce((sum, { key }) => sum + (point[key] as number), 0),
  }));

  return { points: merged, matched, mismatched };
};


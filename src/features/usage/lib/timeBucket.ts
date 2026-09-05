import type { Granularity } from "../type/analytics.type";

const pad = (value: number) => String(value).padStart(2, "0");

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** จำนวน bucket ที่แสดงบนกราฟแต่ละใบ */
export const BUCKET_COUNT: Record<Granularity, number> = {
  hour: 24,
  day: 30,
  month: 12,
  year: 5,
};

/**
 * คีย์ประจำ bucket ในเวลาท้องถิ่น ใช้จับคู่ข้อมูลจาก API กับแกนที่เราสร้างไว้
 * ทุกค่าที่ API ส่งมาจะถูก parse เป็น Date แล้วสร้างคีย์ใหม่ด้วยฟังก์ชันนี้
 * เพื่อไม่ให้ timezone ของ backend ทำให้ bucket เลื่อน
 */
export const toBucketKey = (date: Date, granularity: Granularity) => {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  switch (granularity) {
    case "hour":
      return `${y}-${m}-${d}T${pad(date.getHours())}`;
    case "day":
      return `${y}-${m}-${d}`;
    case "month":
      return `${y}-${m}`;
    case "year":
      return `${y}`;
  }
};

/** ปัดเวลาลงมาที่ต้นของ bucket */
export const startOfBucket = (date: Date, granularity: Granularity) => {
  const next = new Date(date);
  next.setMilliseconds(0);
  next.setSeconds(0);
  next.setMinutes(0);

  if (granularity === "hour") return next;

  next.setHours(0);
  if (granularity === "day") return next;

  next.setDate(1);
  if (granularity === "month") return next;

  next.setMonth(0);
  return next;
};

/** ถอยหลังไป `amount` bucket จากเวลาที่ให้มา */
export const shiftBucket = (
  date: Date,
  granularity: Granularity,
  amount: number
) => {
  const next = new Date(date);

  switch (granularity) {
    case "hour":
      next.setHours(next.getHours() + amount);
      break;
    case "day":
      next.setDate(next.getDate() + amount);
      break;
    case "month":
      next.setMonth(next.getMonth() + amount);
      break;
    case "year":
      next.setFullYear(next.getFullYear() + amount);
      break;
  }

  return next;
};

/** ป้ายสั้นบนแกน x */
export const toAxisLabel = (date: Date, granularity: Granularity) => {
  switch (granularity) {
    case "hour":
      return `${pad(date.getHours())}:00`;
    case "day":
      return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
    case "month":
      return MONTHS_SHORT[date.getMonth()];
    case "year":
      return String(date.getFullYear());
  }
};

/** ป้ายเต็มบนหัว tooltip */
export const toFullLabel = (date: Date, granularity: Granularity) => {
  const day = `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  switch (granularity) {
    case "hour":
      return `${day} · ${pad(date.getHours())}:00`;
    case "day":
      return day;
    case "month":
      return `${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
    case "year":
      return String(date.getFullYear());
  }
};

/**
 * โครงแกนเวลาที่ต่อเนื่อง จบที่ bucket ปัจจุบัน
 * สร้างล่วงหน้าเสมอ เพื่อให้ช่วงที่ API ไม่มีข้อมูลแสดงเป็น 0 แทนที่จะหายไปจากกราฟ
 */
export const buildBucketRange = (granularity: Granularity, now = new Date()) => {
  const end = startOfBucket(now, granularity);
  const count = BUCKET_COUNT[granularity];

  return Array.from({ length: count }, (_, index) => {
    const date = shiftBucket(end, granularity, index - (count - 1));

    return {
      date,
      bucket: toBucketKey(date, granularity),
      label: toAxisLabel(date, granularity),
      fullLabel: toFullLabel(date, granularity),
    };
  });
};

/** ช่วงเวลาที่ส่งเป็น query ให้ backend */
export const buildRangeQuery = (granularity: Granularity, now = new Date()) => {
  const range = buildBucketRange(granularity, now);

  return {
    from: range[0].date.toISOString(),
    to: shiftBucket(range[range.length - 1].date, granularity, 1).toISOString(),
  };
};

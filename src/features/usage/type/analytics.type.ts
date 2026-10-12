/** ข้อมูลสำหรับกราฟบนหน้า usage/Graph มาจาก `/admin/analytics/*` */

export type AnalyticsMetric = "chat" | "creditUsage" | "followers" | "revenue";

export type Granularity = "hour" | "day" | "month" | "year";

/** หนึ่งจุดบนแกน x ค่าของแต่ละ series ถูกแบนเข้ามาเป็น key ตรง ๆ ให้ recharts อ่านได้เลย */
export type AnalyticsPoint = {
  /** คีย์เวลาท้องถิ่นที่ normalize แล้ว เช่น `2026-09-01T14` / `2026-09` / `2026` */
  bucket: string;
  /** ป้ายบนแกน x */
  label: string;
  /** ป้ายเต็มบนหัว tooltip */
  fullLabel: string;
  total: number;
  [series: string]: number | string;
};

/**
 * เหตุผลที่ต้องตกไปใช้ข้อมูลตัวอย่าง แยกให้ชัดว่าเป็นปัญหาคนละแบบ
 * - error: ยิง API ไม่ผ่าน เช่น 401 หรือ backend ล่ม
 * - empty: ยิงผ่านแต่ backend ไม่ส่ง row มาเลย
 * - shape: มี row แต่ map เข้ากราฟไม่ได้ แปลว่าชื่อฟิลด์ไม่ตรงกับที่ normalizer เดาไว้
 */
export type SampleReason = "error" | "empty" | "shape";

export type AnalyticsSeries = {
  metric: AnalyticsMetric;
  granularity: Granularity;
  points: AnalyticsPoint[];
  /** ยอดบนหัวการ์ด รวมทั้งช่วงหรือค่าล่าสุด แล้วแต่ metric */
  headline: number;
  /** true เมื่อยังไม่ได้ข้อมูลจริงและกำลังโชว์ชุดตัวอย่างแทน */
  isSample: boolean;
  /** บอกว่าทำไมถึงไม่ได้ข้อมูลจริง มีค่าเฉพาะตอน isSample */
  sampleReason?: SampleReason;
  /** ข้อมูลจริง แต่ map ได้ไม่ครบทุกฟิลด์ ตัวเลขที่โชว์จะต่ำกว่าที่ backend บอก */
  isPartial?: boolean;
  /** จำนวน row ที่ backend ส่งมาจริง ๆ ใช้ดีบักตอนชื่อฟิลด์ไม่ตรง */
  rowCount: number;
  /** ข้อความ error จาก API ถ้ายิงไม่ผ่าน */
  errorMessage?: string;
};

/** row ดิบจาก backend เปิดกว้างไว้เพราะยังไม่ล็อก DTO */
export type AnalyticsRow = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/* รูปแบบที่ `/api/admin/analytics/*` คืนกลับมาจริง                              */
/* ทุก endpoint ใช้ query เดียวกัน: ?interval=hour|day|month|year&from&to        */
/* bucket ถูกตัดด้วย UTC และ timestamp มาเป็น                                    */
/* `2026-09-01T13:00:00Z` / `2026-09-01` / `2026-09` / `2026` ตาม interval       */
/* -------------------------------------------------------------------------- */

export type AnalyticsRangeInfo = {
  from: string;
  to: string;
  interval: Granularity;
  timezone: string;
};

export type ChatActivityRow = {
  timestamp: string;
  user: number;
  ai: number;
  admin: number;
  system: number;
  total: number;
};

export type ChatActivityResponse = {
  range: AnalyticsRangeInfo;
  totals: Omit<ChatActivityRow, "timestamp">;
  series: ChatActivityRow[];
};

/** ยอดของหนึ่งหมวดในหนึ่ง bucket — ค่าเงิน/เครดิตมาเป็น string เพราะเป็น Decimal */
export type CreditTotals = {
  events: number;
  chargedCredit: string;
  inputTokens: number;
  cachedInputTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type CreditUsageRow = {
  timestamp: string;
  lineMessage: CreditTotals;
  aiUsage: CreditTotals;
  adminAiQuery: CreditTotals;
  total: CreditTotals;
};

export type CreditUsageResponse = {
  range: AnalyticsRangeInfo;
  categories: Record<string, string[]>;
  totals: CreditTotals;
  series: CreditUsageRow[];
};

export type FollowerRow = {
  timestamp: string;
  snapshotDate: string | null;
  /** null = วันนั้นไม่มี snapshot ไม่ใช่ผู้ติดตามเป็นศูนย์ */
  followerCount: number | null;
  targetedReaches: number | null;
  blockCount: number | null;
  growth: number | null;
  growthPercent: number | null;
};

export type FollowersResponse = {
  range: AnalyticsRangeInfo;
  baseline: { date: string; followerCount: number } | null;
  summary: {
    first: number | null;
    last: number | null;
    growth: number | null;
    growthPercent: number | null;
  };
  series: FollowerRow[];
};

export type RevenueRow = {
  timestamp: string;
  amount: string;
  count: number;
};

export type RevenueResponse = {
  range: AnalyticsRangeInfo;
  totals: { amount: string; count: number };
  series: RevenueRow[];
};

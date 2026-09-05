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

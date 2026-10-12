/** ค่าที่ backend เก็บ ไม่ต้องแปล ใช้เป็น key ของ label บน UI */
export const USER_PLANS = ["starter", "pro", "business"] as const;
export type UserPlan = (typeof USER_PLANS)[number];

/**
 * ตรงกับค่า statusaccount ที่ backend เก็บ ตอนนี้สมัครใหม่ได้ "pending"
 * อย่างเดียว ที่เหลือเตรียมไว้ให้ฝั่ง backend เปิดใช้ทีหลัง
 */
export const USER_STATUSES = [
  "pending",
  "active",
  "paused",
  "inactive",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_SORTS = ["newest", "oldest", "lastActive", "name"] as const;
export type UserSort = (typeof USER_SORTS)[number];

/**
 * แท็บผู้ใช้ที่สมัครแล้วยังไม่มีเวลาใช้งานล่าสุดของตัวเอง (มีแต่ของโปรไฟล์
 * LINE ที่ผูกไว้ ซึ่ง backend เรียงให้ไม่ได้) จึงไม่เปิดตัวเลือกนั้นให้เลือก
 */
export const REGISTERED_SORTS: UserSort[] = ["newest", "oldest", "name"];
export const LINE_SORTS: UserSort[] = [...USER_SORTS];

/** สองแท็บบนหัวหน้า — ลูกค้าที่สมัครแล้ว กับคนที่ทักมาทาง LINE เฉย ๆ */
export type UserTab = "registered" | "line";

export type RegisteredUser = {
  id: string;
  name: string;
  /** handle ที่แสดงใต้ชื่อ เก็บโดยไม่มี @ นำหน้า */
  username: string;
  avatar?: string | null;
  phone?: string | null;
  /** LINE userId ที่ผูกไว้ กับชื่อที่แสดงของโปรไฟล์นั้น */
  lineId?: string | null;
  lineName?: string | null;
  /** ยังไม่มีแพ็กเกจในฐานข้อมูล ตารางจึงแสดงขีดไว้ก่อน */
  plan?: UserPlan | null;
  status: UserStatus;
  /** ISO string */
  joinedAt: string;
  /** ISO string — ว่างได้ถ้ายังไม่เคยคุยผ่าน LINE */
  lastActiveAt?: string | null;
};

/** คนที่ทักเข้ามาทาง LINE แต่ยังไม่ได้สมัครสมาชิก */
export type LineUser = {
  id: string;
  displayName: string;
  lineId: string;
  avatar?: string | null;
  /** ISO string */
  firstSeenAt: string;
  /** ISO string */
  lastActiveAt?: string | null;
  messageCount: number;
};

export type UserTabCounts = {
  registered: number;
  line: number;
};

/** เงื่อนไขค้นหาที่ส่งต่อเป็น query string ของ /users และ /users/line */
export type UserListParams = {
  search: string;
  status: UserStatus | "all";
  sort: UserSort;
  page: number;
  pageSize: number;
};

export type Paginated<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
};

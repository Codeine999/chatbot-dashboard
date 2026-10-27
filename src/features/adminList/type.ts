import type { AdminRole } from "@/features/auth/types/auth.type";

export type { AdminRole };

/** ลำดับที่ใช้เรียงและแสดงในตัวกรอง จากสิทธิ์สูงไปต่ำ */
export const ADMIN_ROLES = ["dev", "owner", "admin"] as const;

/** หนึ่งแถวจาก GET /api/admin/all */
export type AdminAccount = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string | null;
  role: AdminRole;
  /** เปิดให้ใช้ AI หลังบ้านได้หรือไม่ */
  aiEnabled: boolean;
  /** ISO string */
  createdAt: string;
};

export type AdminListFilter = {
  search: string;
  role: AdminRole | "all";
};

/** dev สร้างผ่านหน้านี้ไม่ได้ (backend ปฏิเสธ) จึงให้เลือกได้แค่สองสิทธิ์นี้ */
export const ADMIN_CREATABLE_ROLES = ["owner", "admin"] as const;

export type AdminCreatableRole = (typeof ADMIN_CREATABLE_ROLES)[number];

export const isCreatableRole = (value: string): value is AdminCreatableRole =>
  (ADMIN_CREATABLE_ROLES as readonly string[]).includes(value);

/** body ของ POST /api/admin */
export type CreateAdminPayload = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminCreatableRole;
  /** ไม่ส่ง = บัญชีเริ่มต้นแบบยังใช้ AI ไม่ได้ */
  aiBudgetLimitCredit?: string;
};

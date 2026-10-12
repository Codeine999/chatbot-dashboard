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

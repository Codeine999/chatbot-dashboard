export type AdminRole = "dev" | "admin" | "owner" | (string & {});

/** ข้อมูล admin ที่ backend ส่งกลับมาตอน login */
export type Admin = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  image: string | null;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  admin: Admin;
};

/** ข้อมูลผู้ใช้ที่เก็บลง store (subset ของ Admin ที่ UI ใช้จริง) */
export type AuthUser = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: AdminRole;
  /** "" เมื่อไม่มีรูป เพื่อให้ component ใช้ได้เลยโดยไม่ต้องเช็ค null */
  image: string;
};

import { Navigate, Outlet } from "react-router-dom";
import { useAuthUser } from "../store/auth.store";
import type { AdminRole } from "../types/auth.type";

/**
 * กันหน้าที่เปิดเฉพาะบาง role (ซ่อนเมนูอย่างเดียวไม่พอ เพราะพิมพ์ URL ตรงได้)
 * role ไม่ตรง -> กลับหน้าแรก ใช้ซ้อนใน ProtectedRoute เท่านั้น
 */
const RoleRoute = ({ roles }: { roles: AdminRole[] }) => {
  const user = useAuthUser();

  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default RoleRoute;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../store/auth.store";
import type { FromLocationState } from "../types/auth.type";

/**
 * กันหน้าที่ต้อง login ก่อนถึงจะเห็นข้อมูลได้
 * ยังไม่ login -> เด้งไป /login พร้อมจำหน้าเดิมไว้ใน state.from
 *
 * auth store ใช้ zustand persist บน localStorage ซึ่ง hydrate แบบ sync
 * ตั้งแต่ตอนสร้าง store ทำให้ render แรกอ่าน token ได้เลย ไม่ต้องมี loading state
 * และไม่มีอาการหน้ากระพริบไป login ตอน refresh
 */
const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`;

    return (
      <Navigate to="/login" state={{ from } satisfies FromLocationState} replace />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../store/auth.store";
import type { FromLocationState } from "../types/auth.type";

/**
 * กันหน้าสำหรับคนที่ยังไม่ login (login / สมัครสมาชิก)
 * login อยู่แล้ว -> เด้งกลับหน้าที่ตั้งใจเข้า ไม่งั้นกลับหน้าแรก
 */
const GuestRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (isAuthenticated) {
    const state = location.state as FromLocationState | null;

    return <Navigate to={state?.from ?? "/"} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;

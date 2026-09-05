import { useLocation } from "react-router-dom";

/** หน้าที่ล็อก sidebar หลักไว้ที่แถบไอคอน ขยายไม่ได้ */
export const SIDEBAR_LOCKED_ROUTES = ["/ai-chat"];

export const isSidebarLockedRoute = (pathname: string) =>
  SIDEBAR_LOCKED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

/**
 * ตัดสินจาก path ตรง ๆ ไม่ผ่าน state ที่ set ใน useEffect
 * เพราะต้องได้ค่าที่ถูกต้องตั้งแต่ render แรก ไม่งั้นจะกระพริบตอน refresh
 */
export const useSidebarLocked = () =>
  isSidebarLockedRoute(useLocation().pathname);

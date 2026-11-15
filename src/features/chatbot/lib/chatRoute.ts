import { useLocation } from "react-router-dom";
import { create } from "zustand";

export const AI_CHAT_URL = "/ai-chat";

export const isAiChatRoute = (pathname: string) =>
  pathname === AI_CHAT_URL || pathname.startsWith(`${AI_CHAT_URL}/`);

/** ตัดสินจาก path ตรง ๆ ไม่ผ่าน state ที่ set ใน useEffect จะได้ถูกตั้งแต่ render แรก */
export const useIsAiChatRoute = () => isAiChatRoute(useLocation().pathname);

type ReturnPathState = {
  /** หน้าล่าสุดที่ไม่ใช่ AI Chat ใช้เป็นปลายทางของปุ่ม "ออก" */
  path: string;
  setPath: (path: string) => void;
};

export const useReturnPathStore = create<ReturnPathState>()((set) => ({
  path: "/",
  setPath: (path) => set({ path }),
}));

import { create } from "zustand";

type ChatTitleState = {
  /** ชื่อห้องแชทที่เปิดอยู่ null = แชทใหม่ที่ยังไม่มีห้อง */
  title: string | null;
  setTitle: (title: string | null) => void;
};

/** ส่งชื่อห้องแชทจากหน้าแชทไปให้ Navbar ซึ่งอยู่นอกหน้า (ใน Layout) แสดงมุมซ้าย */
export const useChatTitleStore = create<ChatTitleState>()((set) => ({
  title: null,
  setTitle: (title) => set({ title }),
}));

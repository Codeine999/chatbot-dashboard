import { create } from "zustand";

type AdminToolChatState = {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

/** สถานะเปิด/ปิดแผงผู้ช่วย AI — แยกเป็น store เพื่อให้ปุ่ม Ask บน navbar สั่งเปิดได้ */
export const useAdminToolChatStore = create<AdminToolChatState>((set) => ({
  isOpen: false,
  setIsOpen: (value) =>
    set((state) => ({ isOpen: typeof value === "function" ? value(state.isOpen) : value })),
}));

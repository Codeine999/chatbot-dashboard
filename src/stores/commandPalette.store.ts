import { create } from "zustand";

type CommandPaletteState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

/** เปิด command palette (⌘K) จากที่ไหนก็ได้ เช่น ปุ่มค้นหาบน navbar */
export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));

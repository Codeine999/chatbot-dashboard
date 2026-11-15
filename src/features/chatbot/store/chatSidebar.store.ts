import { create } from "zustand";
import type { ChatHistorySidebarProps } from "../components/ChatHistorySidebar";

type ChatSidebarState = {
  /** ข้อมูล + handler ของรายการแชท หน้า Chatbot เป็นเจ้าของ state แล้วส่งมาให้ sidebar หลักแสดง */
  props: ChatHistorySidebarProps | null;
  setProps: (props: ChatHistorySidebarProps | null) => void;
};

export const useChatSidebarStore = create<ChatSidebarState>()((set) => ({
  props: null,
  setProps: (props) => set({ props }),
}));

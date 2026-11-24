import { api } from "@/api/api";
import type {
  ConnectFacebookChannelInput,
  FacebookChannelSaveResult,
  FacebookChannelState,
} from "../type";

/** backend เรียก Graph 2 ครั้งต่อเนื่อง (ตรวจ token, subscribe) จึงให้เวลามากกว่า timeout ปกติ */
const CONNECT_TIMEOUT_MS = 30_000;

export const facebookChannelApi = {
  getStatus: async (): Promise<FacebookChannelState> => {
    const res = await api.get<FacebookChannelState>("/admin/facebook/channel");
    return res.data;
  },

  /** upsert: ครั้งแรกสร้าง ครั้งต่อไปแก้ค่าเดิม ส่งซ้ำได้ปลอดภัย (webhook URL กับ verify token ไม่เปลี่ยน) */
  connect: async (
    input: ConnectFacebookChannelInput
  ): Promise<FacebookChannelSaveResult> => {
    const res = await api.put<FacebookChannelSaveResult>(
      "/admin/facebook/channel",
      input,
      { timeout: CONNECT_TIMEOUT_MS }
    );
    return res.data;
  },

  disconnect: async (): Promise<void> => {
    await api.delete("/admin/facebook/channel");
  },
};

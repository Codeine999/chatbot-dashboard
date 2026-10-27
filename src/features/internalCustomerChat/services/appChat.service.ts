import axios from "axios";
import { api } from "@/api/api";
import type {
  AppConversation,
  AppGuestInfo,
  AppGuestSendBody,
  AppGuestSendResult,
  AppGuestSession,
  AppHistoryMessage,
} from "../type";

/**
 * guest API เป็น public และใช้ Bearer token ของ guest เอง จึงต้องไม่ใช้ `api` ตัวหลัก
 * (ตัวนั้นแนบ JWT แอดมินและ header ที่ CORS ของ /api/app/* ไม่อนุญาต)
 */
const guestApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const ADMIN_BASE = "/admin/app-conversations";
const GUEST_BASE = "/app/v1";

type GetMessagesParams = {
  conversationId: string;
  before?: string;
  after?: string;
  limit?: number;
};

export const appChatApi = {
  // --- แอดมิน: ห้องแชทและประวัติ ---
  getConversations: async (): Promise<AppConversation[]> => {
    const res = await api.get<AppConversation[]>(ADMIN_BASE);
    return res.data;
  },

  getMessages: async ({
    conversationId,
    before,
    after,
    limit = 30,
  }: GetMessagesParams): Promise<AppHistoryMessage[]> => {
    const res = await api.get<AppHistoryMessage[]>(`${ADMIN_BASE}/${conversationId}/messages`, {
      params: { before, after, limit },
    });
    return res.data;
  },

  sendAdminMessage: async ({
    conversationId,
    text,
    clientRequestId,
  }: {
    conversationId: string;
    text: string;
    clientRequestId: string;
  }): Promise<AppHistoryMessage> => {
    const res = await api.post<AppHistoryMessage>(`${ADMIN_BASE}/${conversationId}/messages`, {
      text,
      clientRequestId,
    });
    return res.data;
  },

  pauseBot: async (conversationId: string): Promise<{ botMode: "paused" }> => {
    const res = await api.post<{ botMode: "paused" }>(`${ADMIN_BASE}/${conversationId}/pause-bot`);
    return res.data;
  },

  resumeBot: async (conversationId: string): Promise<{ status: string }> => {
    const res = await api.post<{ status: string }>(`${ADMIN_BASE}/${conversationId}/resume-bot`);
    return res.data;
  },

  // --- guest (ลูกค้าจำลอง) ---
  createGuestSession: async (displayName: string): Promise<AppGuestSession> => {
    const res = await guestApi.post<AppGuestSession>(`${GUEST_BASE}/sessions`, { displayName });
    return res.data;
  },

  describeGuest: async (token: string): Promise<AppGuestInfo> => {
    const res = await guestApi.get<AppGuestInfo>(`${GUEST_BASE}/session`, bearer(token));
    return res.data;
  },

  /** รอ AI หลายวินาทีได้ จึงขยาย timeout จากค่าปกติ 15 วินาที */
  sendGuestMessage: async (
    token: string,
    body: AppGuestSendBody
  ): Promise<AppGuestSendResult> => {
    const res = await guestApi.post<AppGuestSendResult>(`${GUEST_BASE}/messages`, body, {
      ...bearer(token),
      timeout: 120_000,
    });
    return res.data;
  },

  revokeGuest: async (token: string): Promise<void> => {
    await guestApi.delete(`${GUEST_BASE}/session`, bearer(token));
  },
};

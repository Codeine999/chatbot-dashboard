import { api } from "@/api/api";
import type {
  BotModeResponse,
  LineChatHistory,
  LineConversation,
  ResumeBotResponse,
} from "../types/lineChat.type";

type ListResponse<T> =
  | T[]
  | {
      data?: T[] | { items?: T[]; conversations?: T[]; messages?: T[] };
      items?: T[];
      conversations?: T[];
      messages?: T[];
      result?: T[];
    };

const toArray = <T,>(payload: ListResponse<T>): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data?.conversations)) return payload.data.conversations;
  if (Array.isArray(payload.data?.messages)) return payload.data.messages;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.conversations)) return payload.conversations;
  if (Array.isArray(payload.messages)) return payload.messages;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
};

type GetConversationMessagesParams = {
  conversationId: string;
  before?: string;
  after?: string;
  limit?: number;
};

export const lineChatApi = {
  getConversations: async (): Promise<LineConversation[]> => {
    const res = await api.get<ListResponse<LineConversation>>("/line/conversations");
    return toArray(res.data);
  },

  getConversationMessages: async ({
    conversationId,
    before,
    after,
    limit = 30,
  }: GetConversationMessagesParams): Promise<LineChatHistory[]> => {
    const params = new URLSearchParams();

    if (before) params.set("before", before);
    if (after) params.set("after", after);
    if (limit) params.set("limit", String(limit));

    const query = params.toString();
    const res = await api.get<ListResponse<LineChatHistory>>(
      `/line/conversations/${conversationId}/messages${query ? `?${query}` : ""}`
    );

    return toArray(res.data);
  },

  /** clientRequestId (UUID) กันส่งซ้ำ: ส่ง id เดิมซ้ำ backend ไม่ส่งข้อความซ้ำ */
  sendMessage: async ({
    conversationId,
    text,
    clientRequestId,
  }: {
    conversationId: string;
    text: string;
    clientRequestId: string;
  }): Promise<LineChatHistory> => {
    const res = await api.post<LineChatHistory>(
      `/line/conversations/${conversationId}/messages`,
      { text, clientRequestId }
    );

    return res.data;
  },

  /** รีเซ็ต unreadCount ของห้องเป็น 0 (backend ไม่รีเซ็ตให้เอง เรียกซ้ำได้) */
  markRead: async (conversationId: string): Promise<{ id: string; unreadCount: 0 }> => {
    const res = await api.post<{ id: string; unreadCount: 0 }>(
      `/line/conversations/${conversationId}/read`
    );
    return res.data;
  },

  /** แอดมินดูแลอยู่: บอทเงียบชั่วคราว (botMuteUntil) แล้วกลับมาตอบเอง */
  adminHold: async (conversationId: string): Promise<BotModeResponse> => {
    const res = await api.post<BotModeResponse>(
      `/line/conversations/${conversationId}/admin-hold`
    );
    return res.data;
  },

  /** พักบอท: หยุดตอบในห้องนี้จนกว่าจะเปิดกลับ หรือถึง botMuteUntil */
  pauseBot: async (conversationId: string): Promise<BotModeResponse> => {
    const res = await api.post<BotModeResponse>(
      `/line/conversations/${conversationId}/pause-bot`
    );
    return res.data;
  },

  /**
   * ปลดการพักบอทของห้องนี้ทันที แทนที่จะรอให้ Redis mute หมดอายุเอง
   * backend ยังล้าง context ของห้องและตั้งสถานะกลับเป็น open ให้ด้วย (ไม่ลบข้อมูลสมัครสมาชิก)
   */
  resumeBot: async (conversationId: string): Promise<ResumeBotResponse> => {
    const res = await api.post<ResumeBotResponse>(
      `/line/conversations/${conversationId}/resume-bot`
    );

    return res.data;
  },
};

import { api } from "@/api/api";
import i18n from "@/i18n";
import type {
  BotMode,
  BotModeResponse,
  LineChatHistory,
  LineChatSender,
  LineConversation,
  ResumeBotResponse,
} from "../types/lineChat.type";
import type { ConversationPage } from "./lineChat.service";

/**
 * Facebook Messenger inbox: backend เก็บห้องของช่องทางที่ไม่ใช่ LINE ในตาราง channel*
 * รูปร่างข้อมูลคล้าย LINE แต่ไม่เหมือน จึงแปลงเป็น LineConversation / LineChatHistory
 * ที่หน้าแชทใช้อยู่ที่ชั้นนี้ชั้นเดียว ส่วนอื่นของหน้าไม่ต้องรู้ว่าห้องมาจากช่องทางไหน
 */
const BASE = "/admin/channels/facebook/conversations";

type ChannelRoom = {
  id: string;
  status: string;
  lastMessage: string;
  /** ประเภทของข้อความล่าสุดที่ backend เก็บ: TEXT, UNSUPPORTED (ไฟล์แนบที่ยังไม่รองรับ) */
  lastMessageType?: string;
  lastMessageAt: string;
  unreadCount: number;
  contact: {
    id: string;
    displayName: string | null;
    pictureUrl?: string | null;
  };
  botMode?: BotMode;
  botMuteUntil?: string | null;
};

type ChannelRoomPage = { items: ChannelRoom[]; nextCursor?: string | null };

type ChannelMessage = {
  id: string;
  conversationId: string;
  sender: string;
  messageType: string;
  text: string | null;
  sentStatus: string;
  metadata?: { adminName?: unknown } | null;
  createdAt: string;
};

/** ข้อความล่าสุดที่เป็นไฟล์แนบ: backend เก็บข้อความนี้ไว้เป็น "[attachment]" ให้แสดงเป็นข้อความที่แปลแล้ว */
const ATTACHMENT_PREVIEW = "[attachment]";

export const toFacebookConversation = (room: ChannelRoom): LineConversation => {
  const unsupported = room.lastMessageType === "UNSUPPORTED";
  return {
    id: room.id,
    lineMemberId: room.contact.id,
    status: room.status,
    lastMessage:
      unsupported || room.lastMessage === ATTACHMENT_PREVIEW
        ? i18n.t("chat:line.message.unsupported")
        : room.lastMessage,
    // ไฟล์แนบแสดงเป็นข้อความตัวอักษร (ข้อความที่แปลแล้ว) เพราะ UI ไม่มีป้ายชนิดไฟล์
    lastMessageType: "TEXT",
    lastMessageAt: room.lastMessageAt,
    unreadCount: room.unreadCount,
    // ชื่อและรูปมาจาก Facebook ตอนลูกค้าทักครั้งแรก (ดึงไม่ได้ก็ใช้ชื่อสำรอง และ Avatar แสดงอักษรแรกแทนรูป)
    lineMember: {
      id: room.contact.id,
      lineUserId: "",
      displayName: room.contact.displayName ?? i18n.t("chat:line.facebookUser"),
      pictureUrl: room.contact.pictureUrl ?? null,
      lastActiveAt: room.lastMessageAt,
    },
    botMode: room.botMode ?? "auto",
    botMuteUntil: room.botMuteUntil ?? null,
    platform: "messenger",
  };
};

export const toFacebookMessage = (message: ChannelMessage): LineChatHistory => {
  const sender = message.sender.toUpperCase() as LineChatSender;
  const adminName = message.metadata?.adminName;
  return {
    id: message.id,
    conversationId: message.conversationId,
    lineMemberId: "",
    sender,
    // backend ยังไม่เก็บว่าแอดมินคนไหนตอบ ไม่ใส่ชื่อ UI จะเขียนว่า AI ผิดคน
    sentByAdminId:
      sender === "ADMIN"
        ? typeof adminName === "string" && adminName
          ? adminName
          : i18n.t("chat:line.adminLabel")
        : null,
    messageType: "TEXT",
    // ไฟล์แนบที่ระบบยังไม่รองรับ backend เก็บเป็น UNSUPPORTED ไม่มีข้อความ
    text:
      message.messageType === "UNSUPPORTED" || !message.text
        ? i18n.t("chat:line.message.unsupported")
        : message.text,
    sentStatus: message.sentStatus,
    createdAt: message.createdAt,
  };
};

export const facebookChatApi = {
  getConversations: async ({
    limit = 30,
    cursor,
  }: { limit?: number; cursor?: string } = {}): Promise<ConversationPage> => {
    const res = await api.get<ChannelRoomPage | ChannelRoom[]>(BASE, {
      params: { limit, cursor },
    });
    const items = Array.isArray(res.data) ? res.data : res.data.items;
    const nextCursor = Array.isArray(res.data)
      ? null
      : (res.data.nextCursor ?? null);
    return { items: items.map(toFacebookConversation), nextCursor };
  },

  getConversationMessages: async ({
    conversationId,
    before,
    after,
    limit = 30,
  }: {
    conversationId: string;
    before?: string;
    after?: string;
    limit?: number;
  }): Promise<LineChatHistory[]> => {
    const res = await api.get<ChannelMessage[]>(
      `${BASE}/${conversationId}/messages`,
      {
        params: { before, after, limit },
      },
    );
    return res.data.map(toFacebookMessage);
  },

  /** clientRequestId (UUID) กันส่งซ้ำ เหมือนฝั่ง LINE */
  sendMessage: async ({
    conversationId,
    text,
    clientRequestId,
  }: {
    conversationId: string;
    text: string;
    clientRequestId: string;
  }): Promise<LineChatHistory> => {
    const res = await api.post<ChannelMessage>(
      `${BASE}/${conversationId}/messages`,
      {
        text,
        clientRequestId,
      },
    );
    return toFacebookMessage(res.data);
  },

  markRead: async (
    conversationId: string,
  ): Promise<{ id: string; unreadCount: 0 }> => {
    const res = await api.post<{ id: string; unreadCount: 0 }>(
      `${BASE}/${conversationId}/read`,
    );
    return res.data;
  },

  adminHold: async (conversationId: string): Promise<BotModeResponse> => {
    const res = await api.post<BotModeResponse>(
      `${BASE}/${conversationId}/admin-hold`,
    );
    return res.data;
  },

  /** backend ตอบแค่ botMode ไม่มีเวลาหมด (พักถึงกว่าจะเปิดกลับ สูงสุด 7 วัน) */
  pauseBot: async (conversationId: string): Promise<BotModeResponse> => {
    const res = await api.post<Partial<BotModeResponse>>(
      `${BASE}/${conversationId}/pause-bot`,
    );
    return {
      ...res.data,
      botMode: "paused",
      botMuteUntil: res.data.botMuteUntil ?? null,
    };
  },

  resumeBot: async (conversationId: string): Promise<ResumeBotResponse> => {
    const res = await api.post<ResumeBotResponse>(
      `${BASE}/${conversationId}/resume-bot`,
    );
    return res.data;
  },
};

import { api } from "@/api/api";
import type { LineChatHistory, LineConversation } from "../types/lineChat.type";

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

export const lineChatApi = {
  getConversations: async (): Promise<LineConversation[]> => {
    const res = await api.get<ListResponse<LineConversation>>("/line/conversations");
    return toArray(res.data);
  },

  getConversationMessages: async ({
    conversationId,
    before,
    limit = 30,
  }: {
    conversationId: string;
    before?: string;
    limit?: number;
  }): Promise<LineChatHistory[]> => {
    const res = await api.get<ListResponse<LineChatHistory>>(
      `/line/conversations/${conversationId}/messages`,
      {
        params: {
          before,
          limit,
        },
      }
    );

    return toArray(res.data);
  },

  sendMessage: async ({
    conversationId,
    text,
  }: {
    conversationId: string;
    text: string;
  }): Promise<LineChatHistory> => {
    const res = await api.post<LineChatHistory>(
      `/conversations/${conversationId}/messages`,
      { text }
    );

    return res.data;
  },
};

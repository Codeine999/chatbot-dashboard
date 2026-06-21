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

  sendMessage: async ({
    conversationId,
    text,
  }: {
    conversationId: string;
    text: string;
  }): Promise<LineChatHistory> => {
    const res = await api.post<LineChatHistory>(
      `/line/conversations/${conversationId}/messages`,
      { text }
    );

    return res.data;
  },
};

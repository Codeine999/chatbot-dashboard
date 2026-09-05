import { api } from "@/api/api";
import type { AdminNotification } from "../types/notification.type";

export const notificationApi = {
  list: async (unreadOnly = false): Promise<AdminNotification[]> => {
    const res = await api.get<AdminNotification[]>("/admin/notifications", {
      params: unreadOnly ? { unreadOnly: "true" } : undefined,
    });
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<{ count: number }>(
      "/admin/notifications/unread-count"
    );
    return res.data.count;
  },

  markAsRead: async (id: string): Promise<AdminNotification> => {
    const res = await api.patch<AdminNotification>(
      `/admin/notifications/${id}/read`
    );
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/admin/notifications/read-all");
  },

  markConversationAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/admin/notifications/conversation/${conversationId}/read`);
  },
};

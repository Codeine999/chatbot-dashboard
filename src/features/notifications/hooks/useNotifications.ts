import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { connectAdminSocket, disconnectAdminSocket } from "@/lib/socket";
import { notificationApi } from "../services/notification.service";
import { playNotificationSound } from "../lib/playNotificationSound";
import type { AdminNotification } from "../types/notification.type";

const NOTIFICATIONS_KEY = ["notifications"];
const UNREAD_COUNT_KEY = ["notifications", "unread-count"];

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationApi.list(),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: notificationApi.getUnreadCount,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useMarkConversationNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markConversationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/** Connects the shared admin socket for as long as this is mounted, and
 * reacts to live `ADMIN_NOTIFICATION` events (toast + sound + cache refresh). */
export function useNotificationSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectAdminSocket();

    const handleNotification = (notification: AdminNotification) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });

      playNotificationSound();
      toast(notification.metadata?.displayName ?? notification.title, {
        description:
          notification.metadata?.lastMessage ?? notification.message ?? "",
      });
    };

    socket.on("ADMIN_NOTIFICATION", handleNotification);

    return () => {
      socket.off("ADMIN_NOTIFICATION", handleNotification);
      disconnectAdminSocket();
    };
  }, [queryClient]);
}

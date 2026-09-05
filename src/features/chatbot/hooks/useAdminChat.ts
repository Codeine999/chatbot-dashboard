import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import { adminChatApi } from "../services/adminChat.service";
import type {
  AdminAiProviderSetting,
  AdminChatMessage,
  AdminChatRoom,
  SendAdminChatResult,
} from "../type";

export const adminChatKeys = {
  all: ["admin-chat"] as const,
  rooms: ["admin-chat", "rooms"] as const,
  messages: (roomId?: string) =>
    ["admin-chat", "messages", roomId] as const,
  myUsage: ["admin-chat", "usage", "me"] as const,
  allUsage: ["admin-chat", "usage", "all"] as const,
  providerCatalog: ["admin-chat", "provider-catalog", "me"] as const,
  providerSetting: ["admin-chat", "provider-setting", "me"] as const,
};

export function useAdminChatRooms() {
  return useQuery({
    queryKey: adminChatKeys.rooms,
    queryFn: adminChatApi.listRooms,
  });
}

export function useAdminChatMessages(roomId?: string) {
  return useQuery({
    queryKey: adminChatKeys.messages(roomId),
    queryFn: () => adminChatApi.listMessages(roomId as string),
    enabled: Boolean(roomId),
  });
}

export function useCreateAdminChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => adminChatApi.createRoom(title),
    onSuccess: (room) => {
      queryClient.setQueryData<AdminChatRoom[]>(
        adminChatKeys.rooms,
        (current = []) => [room, ...current.filter((item) => item.id !== room.id)]
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cannot create a new chat"));
    },
  });
}

export function useSendAdminChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminChatApi.sendMessage,
    onSuccess: (result: SendAdminChatResult) => {
      queryClient.setQueryData<AdminChatMessage[]>(
        adminChatKeys.messages(result.roomId),
        (current = []) => {
          const returned = [result.userMessage, result.reply];
          const returnedIds = new Set(returned.map((message) => message.id));
          return [
            ...current.filter((message) => !returnedIds.has(message.id)),
            ...returned,
          ].sort(
            (left, right) =>
              new Date(left.createdAt).getTime() -
              new Date(right.createdAt).getTime()
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: adminChatKeys.rooms });
      queryClient.invalidateQueries({ queryKey: adminChatKeys.myUsage });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "AI could not answer this message"));
    },
    onSettled: (result, _error, variables) => {
      // The backend intentionally keeps the USER turn even when AI/billing
      // fails, so a failed request must still refresh the room history.
      const roomId = result?.roomId ?? variables.roomId;
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: adminChatKeys.messages(roomId),
        });
      }
    },
  });
}

export function useDeleteAdminChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminChatApi.deleteRoom,
    onSuccess: (_result, roomId) => {
      queryClient.setQueryData<AdminChatRoom[]>(
        adminChatKeys.rooms,
        (current = []) => current.filter((room) => room.id !== roomId)
      );
      queryClient.removeQueries({ queryKey: adminChatKeys.messages(roomId) });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cannot delete this chat"));
    },
  });
}

export function useRenameAdminChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, title }: { roomId: string; title: string }) =>
      adminChatApi.renameRoom(roomId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminChatKeys.rooms });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Cannot rename this chat")),
  });
}

export function useMyAdminAiUsage() {
  return useQuery({
    queryKey: adminChatKeys.myUsage,
    queryFn: adminChatApi.getMyUsage,
  });
}

/** dev/owner only — 403 for the `admin` role. */
export function useAllAdminAiUsage(enabled = true) {
  return useQuery({
    queryKey: adminChatKeys.allUsage,
    queryFn: adminChatApi.listAllUsage,
    enabled,
  });
}

export function useMyAiProviderCatalog() {
  return useQuery({
    queryKey: adminChatKeys.providerCatalog,
    queryFn: adminChatApi.getMyProviderCatalog,
  });
}

export function useMyAiProviderSetting() {
  return useQuery({
    queryKey: adminChatKeys.providerSetting,
    queryFn: adminChatApi.getMyProviderSetting,
  });
}

/**
 * Publishes the answering model. It is a back-office setting, not a per-message
 * option, so the change lands in the database and applies to the next turn —
 * including turns started by other admins.
 */
export function useUpdateMyAiProviderSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminChatApi.updateMyProviderSetting,
    onSuccess: (setting: AdminAiProviderSetting) => {
      queryClient.setQueryData(adminChatKeys.providerSetting, setting);
      toast.success(`Now answering with ${setting.model}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cannot change the model"));
    },
  });
}

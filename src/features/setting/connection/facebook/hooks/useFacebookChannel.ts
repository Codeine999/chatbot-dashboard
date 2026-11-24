import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facebookChannelApi } from "../services/facebookChannel.service";
import type {
  ConnectFacebookChannelInput,
  FacebookChannelSaveResult,
  FacebookChannelState,
} from "../type";
import {
  isForbiddenError,
  isTransportError,
} from "../../utils/connectionErrors";

export const facebookChannelKeys = {
  all: ["facebook-channel"] as const,
  status: () => [...facebookChannelKeys.all, "status"] as const,
};

export function useFacebookChannelStatus() {
  return useQuery({
    queryKey: facebookChannelKeys.status(),
    queryFn: facebookChannelApi.getStatus,
    // 403 = สิทธิ์ไม่พอ ลองซ้ำก็ได้ผลเดิม
    retry: (count, error) => !isForbiddenError(error) && count < 1,
  });
}

/**
 * บันทึก credential — ถ้าเน็ตหลุดหรือ timeout กลางทาง server อาจบันทึกไปแล้ว
 * จึงถามสถานะจริงก่อนสรุปว่าล้มเหลว เทียบ verifiedAt กับค่าก่อนกดบันทึก
 */
export function useConnectFacebookChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: ConnectFacebookChannelInput
    ): Promise<FacebookChannelSaveResult> => {
      const before =
        queryClient.getQueryData<FacebookChannelState>(
          facebookChannelKeys.status()
        )?.verifiedAt ?? null;

      try {
        return await facebookChannelApi.connect(input);
      } catch (error) {
        if (!isTransportError(error)) throw error;

        const latest = await facebookChannelApi.getStatus().catch(() => null);
        if (
          latest?.source === "db" &&
          latest.verifiedAt &&
          latest.verifiedAt !== before
        )
          return { ...latest, subscription: null };

        throw error;
      }
    },
    onSuccess: ({ subscription, ...state }) => {
      void subscription;
      queryClient.setQueryData<FacebookChannelState>(
        facebookChannelKeys.status(),
        state
      );
    },
  });
}

export function useDisconnectFacebookChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facebookChannelApi.disconnect,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: facebookChannelKeys.all }),
  });
}

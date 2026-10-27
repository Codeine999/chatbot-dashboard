import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { lineChannelApi } from "../services/lineChannel.service";
import { getConnectErrorMessage } from "../utils/connectionErrors";
import { lineChannelKeys } from "./useLineChannel";

const REFRESH_MS = 30_000;

/** ชั้น 1 + 3: ค่าที่ LINE ใช้อยู่ และ event จริงที่เข้ามา รีเฟรชเองทุก 30 วินาทีตอนเปิดหน้านี้ */
export function useWebhookHealth(enabled: boolean) {
  return useQuery({
    queryKey: lineChannelKeys.webhook(),
    queryFn: lineChannelApi.getWebhookHealth,
    enabled,
    staleTime: 15_000,
    refetchInterval: REFRESH_MS,
    retry: false,
  });
}

/** ชั้น 2: ให้ LINE ยิงมาทดสอบ ผลล่าสุดอยู่ใน mutation.data */
export function useTestWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lineChannelApi.testWebhook,
    onSuccess: () => {
      // backend บันทึกผลทดสอบลง channel จึงต้องโหลดทั้งสถานะและผลตรวจใหม่
      void queryClient.invalidateQueries({ queryKey: lineChannelKeys.all });
    },
    onError: (error) => toast.error(getConnectErrorMessage(error)),
  });
}

import i18n from "@/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import { adminChatKeys } from "@/features/chatbot/hooks/useAdminChat";
import { clearSessionApi } from "../services/clearSession.service";

export function useClearAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearSessionApi.clearAll,
    onSuccess: () => {
      // session ของแชทแอดมินถูกล้างฝั่ง backend จึงต้องโหลดข้อมูลแชทใหม่
      queryClient.invalidateQueries({ queryKey: adminChatKeys.all });
      toast.success(i18n.t("settings:clearSession.toast.cleared"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, i18n.t("settings:clearSession.toast.failed"))
      );
    },
  });
}

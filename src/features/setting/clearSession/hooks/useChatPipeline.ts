import i18n from "@/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import { clearSessionApi } from "../services/clearSession.service";

const pipelineKey = ["admin", "chat-pipeline"] as const;

export function useChatPipeline(enabled: boolean) {
  return useQuery({
    queryKey: pipelineKey,
    queryFn: clearSessionApi.getPipeline,
    enabled,
  });
}

export function useSetChatPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearSessionApi.setPipeline,
    onSuccess: (state) => {
      queryClient.setQueryData(pipelineKey, state);
      toast.success(
        i18n.t(state.paused ? "settings:clearSession.pipeline.paused" : "settings:clearSession.pipeline.resumed")
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("settings:clearSession.pipeline.failed")));
    },
  });
}

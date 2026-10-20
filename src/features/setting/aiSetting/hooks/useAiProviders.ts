import i18n from "@/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import { adminChatKeys } from "@/features/chatbot/hooks/useAdminChat";
import { aiProviderApi } from "../services/aiProvider.service";
import type { AiModelSelection, AiProviderScope } from "../type";

export const aiProviderKeys = {
  catalog: ["ai-provider", "catalog"] as const,
  settings: ["ai-provider", "settings"] as const,
};

export function useAiProviderCatalog() {
  return useQuery({
    queryKey: aiProviderKeys.catalog,
    queryFn: aiProviderApi.getCatalog,
  });
}

export function useAiProviderSettings() {
  return useQuery({
    queryKey: aiProviderKeys.settings,
    queryFn: aiProviderApi.getSettings,
  });
}

export function useUpdateAiProviderSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scope, selection }: { scope: AiProviderScope; selection: AiModelSelection }) =>
      aiProviderApi.updateSetting(scope, selection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProviderKeys.settings });
      // โมเดลฝั่งแอดมินคือตัวเดียวกับที่หน้าแชท AI แสดงอยู่
      queryClient.invalidateQueries({ queryKey: adminChatKeys.providerSetting });
      toast.success(i18n.t("settings:aiSetting.model.saved"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("settings:aiSetting.model.saveFailed")));
    },
  });
}

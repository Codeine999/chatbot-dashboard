import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import {
  lineOaApi,
  type AiProviderSetting,
  type LineBotInfo,
} from "../services/lineOa.service";

const lineOaKeys = {
  info: ["line-oa", "info"] as const,
  providerCatalog: ["line-oa", "provider-catalog", "me"] as const,
};

export function useLineOaInfo() {
  return useQuery({
    queryKey: lineOaKeys.info,
    queryFn: lineOaApi.getInfo,
  });
}

export function useMyAiProviderCatalog(enabled: boolean) {
  return useQuery({
    queryKey: lineOaKeys.providerCatalog,
    queryFn: lineOaApi.getMyAiProviderCatalog,
    enabled,
  });
}

export function useUpdateAdminAiProviderSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lineOaApi.updateAdminAiProviderSetting,
    onSuccess: (setting: AiProviderSetting) => {
      queryClient.setQueryData<LineBotInfo>(lineOaKeys.info, (current) => {
        if (!current) return current;

        const previous = current.aiProviderSettings ?? [];
        const settings = [
          ...previous.filter((item) => item.scope !== setting.scope),
          setting,
        ];

        return { ...current, aiProviderSettings: settings };
      });
      queryClient.invalidateQueries({ queryKey: lineOaKeys.info });
      toast.success(i18n.t("home:account.modelUpdated", { model: setting.model }));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, i18n.t("home:account.modelUpdateError"))
      );
    },
  });
}

export function useLineOaFollowers() {
  return useQuery({
    queryKey: ["line-oa", "followers"],
    queryFn: lineOaApi.getFollowers,
  });
}

export function useLineOaMessageUsage() {
  return useQuery({
    queryKey: ["line-oa", "message-usage"],
    queryFn: lineOaApi.getMessageUsage,
  });
}

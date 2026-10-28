import { useMemo } from "react";
import {
  useMyAdminAiUsage,
  useMyAiProviderCatalog,
  useMyAiProviderSetting,
  useUpdateMyAiProviderSetting,
} from "./useAdminChat";
import type { ModelSelection } from "../lib/chatFormat";

/** โมเดลที่ใช้ตอบ ตัวเลือกทั้งหมด เครดิตที่ใช้ไป และสิทธิ์การเปลี่ยนโมเดล */
export const useChatModel = () => {
  const catalogQuery = useMyAiProviderCatalog();
  const settingQuery = useMyAiProviderSetting();
  const usageQuery = useMyAdminAiUsage();
  const updateModel = useUpdateMyAiProviderSetting();

  const setting = settingQuery.data;

  const options = useMemo(
    () =>
      (catalogQuery.data ?? []).flatMap((provider) =>
        provider.models.map((model) => ({
          provider: provider.provider,
          providerLabel: provider.label,
          available: provider.available,
          model,
        }))
      ),
    [catalogQuery.data]
  );

  const selected: ModelSelection | undefined = setting
    ? { provider: setting.provider, model: setting.model }
    : undefined;

  return {
    options,
    selected,
    aiEnabled: setting?.enabled ?? true,
    // Publishing the model is a back-office setting change, not a chat option.
    canChange: setting?.role === "dev" || setting?.role === "owner",
    isCatalogLoading: catalogQuery.isLoading,
    isUpdating: updateModel.isPending,
    usage: usageQuery.data,
    change: (selection: ModelSelection) => updateModel.mutate(selection),
  };
};

import { api } from "@/api/api";
import type {
  AiModelSelection,
  AiProviderCatalogItem,
  AiProviderScope,
  AiProviderSetting,
} from "../type";

export const aiProviderApi = {
  getCatalog: async (): Promise<AiProviderCatalogItem[]> => {
    const res = await api.get<AiProviderCatalogItem[]>("/admin/ai-providers/catalog");
    return res.data;
  },

  getSettings: async (): Promise<AiProviderSetting[]> => {
    const res = await api.get<AiProviderSetting[]>("/admin/ai-providers/settings");
    return res.data;
  },

  /** dev/owner เท่านั้น — role อื่นได้ 403 */
  updateSetting: async (scope: AiProviderScope, selection: AiModelSelection) => {
    const res = await api.patch(`/admin/ai-providers/settings/${scope}`, selection);
    return res.data;
  },
};

import { api } from "@/api/api";
import type { AiSettingPayload, AiSettingRecord } from "../type";

const BASE = "/admin/ai-settings";

export const aiSettingApi = {
  /** เรียงจากแก้ไขล่าสุดก่อน */
  list: async (): Promise<AiSettingRecord[]> => {
    const res = await api.get<AiSettingRecord[]>(BASE);
    return res.data;
  },

  create: async (payload: AiSettingPayload): Promise<AiSettingRecord> => {
    const res = await api.post<AiSettingRecord>(BASE, payload);
    return res.data;
  },

  update: async (id: string, payload: AiSettingPayload): Promise<AiSettingRecord> => {
    const res = await api.patch<AiSettingRecord>(`${BASE}/${id}`, payload);
    return res.data;
  },
};

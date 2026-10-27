import { api } from "@/api/api";

export const clearSessionApi = {
  /** dev/owner เท่านั้น — role อื่นได้ 403 */
  clearAll: async () => {
    const res = await api.post("/admin/ai-chat/clear-all");
    return res.data;
  },
};

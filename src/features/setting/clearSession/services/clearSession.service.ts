import { api } from "@/api/api";

export type ChatPipelineState = {
  /** true = หยุดตอบ (ยังบันทึกข้อความ) false = ตอบตามปกติ */
  paused: boolean;
  /** redis = เคยตั้งผ่าน API, env = ใช้ค่าจาก CHAT_PIPELINE_PAUSED */
  source: "redis" | "env";
  envDefault: boolean;
};

export const clearSessionApi = {
  /** dev/owner เท่านั้น — role อื่นได้ 403 */
  clearAll: async () => {
    const res = await api.post("/admin/ai-chat/clear-all");
    return res.data;
  },

  getPipeline: async (): Promise<ChatPipelineState> => {
    const res = await api.get<ChatPipelineState>("/admin/chat-pipeline");
    return res.data;
  },

  /** body ต้องมีแค่ paused (boolean) backend ใช้ schema แบบ strict */
  setPipeline: async (paused: boolean): Promise<ChatPipelineState> => {
    const res = await api.put<ChatPipelineState>("/admin/chat-pipeline", { paused });
    return res.data;
  },
};

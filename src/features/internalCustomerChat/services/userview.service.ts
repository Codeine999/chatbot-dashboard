import { api } from "@/api/api";
import type {
  PreviewReply,
  PreviewSession,
  PreviewSessionState,
  SendPreviewMessageBody,
} from "../type";

const BASE = "/admin/userview/sessions";

export const userviewApi = {
  createSession: async (): Promise<PreviewSession> => {
    const res = await api.post<PreviewSession>(BASE);
    return res.data;
  },

  getSession: async (sessionId: string): Promise<PreviewSessionState> => {
    const res = await api.get<PreviewSessionState>(`${BASE}/${sessionId}`);
    return res.data;
  },

  /** รอ AI หลายวินาทีได้ จึงขยาย timeout จากค่าปกติ 15 วินาที */
  sendMessage: async (
    sessionId: string,
    body: SendPreviewMessageBody
  ): Promise<PreviewReply> => {
    const res = await api.post<PreviewReply>(`${BASE}/${sessionId}/messages`, body, {
      timeout: 120_000,
    });
    return res.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`${BASE}/${sessionId}`);
  },
};

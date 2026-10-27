import { api } from "@/api/api";
import type {
  ConnectLineChannelInput,
  LineChannelSaveResult,
  LineChannelState,
  WebhookHealth,
  WebhookTestResult,
} from "../type";

/**
 * backend ต้องเรียก LINE ถึง 4 ครั้งต่อเนื่อง (ตรวจ token, ตั้ง webhook, ทดสอบ)
 * แต่ละครั้งรอได้ถึง 8 วินาที จึงให้เวลามากกว่า timeout ปกติของ api
 */
const CONNECT_TIMEOUT_MS = 45_000;
/** LINE รอ webhook ของเราตอบได้ถึง 8 วินาทีต่อครั้ง */
const TEST_TIMEOUT_MS = 20_000;

export const lineChannelApi = {
  getStatus: async (): Promise<LineChannelState> => {
    const res = await api.get<LineChannelState>("/admin/line/channel");
    return res.data;
  },

  /** upsert: ครั้งแรกสร้าง ครั้งต่อไปแก้ค่าเดิม ส่งซ้ำได้ปลอดภัย */
  connect: async (
    input: ConnectLineChannelInput
  ): Promise<LineChannelSaveResult> => {
    const res = await api.put<LineChannelSaveResult>(
      "/admin/line/channel",
      input,
      { timeout: CONNECT_TIMEOUT_MS }
    );
    return res.data;
  },

  getWebhookHealth: async (): Promise<WebhookHealth> => {
    const res = await api.get<WebhookHealth>("/admin/line/channel/webhook");
    return res.data;
  },

  /** ให้ LINE ยิง event ตัวอย่างมาที่ webhook จริง ๆ แล้วรายงานผล */
  testWebhook: async (): Promise<WebhookTestResult> => {
    const res = await api.post<WebhookTestResult>(
      "/admin/line/channel/webhook/test",
      undefined,
      { timeout: TEST_TIMEOUT_MS }
    );
    return res.data;
  },
};

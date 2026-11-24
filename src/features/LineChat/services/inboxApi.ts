import { facebookChatApi } from "./facebookChat.service";
import { lineChatApi } from "./lineChat.service";
import type { ConversationPlatform } from "../types/lineChat.type";

/** ทั้งสองช่องทางมีสัญญาเดียวกัน หน้าแชทเลือก API จาก platform ของห้องเท่านั้น */
export type InboxApi = typeof lineChatApi;

/** ช่องทางที่มี inbox จริงและแสดงในหน้าแชท (tiktok / application ยังไม่รวม) */
export const INBOX_PLATFORMS = ["line", "messenger"] as const;
export type InboxPlatform = (typeof INBOX_PLATFORMS)[number];

export const inboxApi = (platform: ConversationPlatform | undefined): InboxApi =>
  platform === "messenger" ? facebookChatApi : lineChatApi;

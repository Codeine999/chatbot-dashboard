/** ช่องทางที่ใช้กรองภาพรวมโทเคนและบันทึกการตอบ */
export type TokenChannel = "overall" | "line" | "facebook" | "api";

export const TOKEN_CHANNELS: TokenChannel[] = ["overall", "line", "facebook", "api"];

export type TokenChannelMock = {
  aiChat: { used: number; limit: number };
  lineSend: { used: number; limit: number };
  admin: { used: number; limit: number };
};

/** ยังไม่มี API แยกตามช่องทาง จึงใช้ค่าจำลองสำหรับ Line / Facebook / Api */
export const TOKEN_CHANNEL_MOCK: Record<Exclude<TokenChannel, "overall">, TokenChannelMock> = {
  line: {
    aiChat: { used: 182400, limit: 500000 },
    lineSend: { used: 3120, limit: 5000 },
    admin: { used: 8450, limit: 20000 },
  },
  facebook: {
    aiChat: { used: 64200, limit: 200000 },
    lineSend: { used: 980, limit: 2000 },
    admin: { used: 1200, limit: 10000 },
  },
  api: {
    aiChat: { used: 240500, limit: 300000 },
    lineSend: { used: 0, limit: 0 },
    admin: { used: 0, limit: 5000 },
  },
};

export type TokenLogEntry = {
  id: string;
  /** ISO time ของการตอบ */
  createdAt: string;
  channel: Exclude<TokenChannel, "overall">;
  /** ผู้ตอบ: "AI" หรือ username ของแอดมินที่ตอบ */
  respondedBy: string;
  inputTokens: number;
  outputTokens: number;
};

/** ยังไม่มี API บันทึกการตอบรายครั้ง จึงใช้ข้อมูลจำลอง */
export const TOKEN_LOG_MOCK: TokenLogEntry[] = [
  { id: "r01", createdAt: "2026-11-13T14:55:00", channel: "line", respondedBy: "AI", inputTokens: 1240, outputTokens: 386 },
  { id: "r02", createdAt: "2026-11-13T14:51:00", channel: "line", respondedBy: "AI", inputTokens: 980, outputTokens: 212 },
  { id: "r03", createdAt: "2026-11-13T14:50:00", channel: "facebook", respondedBy: "AI", inputTokens: 1520, outputTokens: 298 },
  { id: "r04", createdAt: "2026-11-13T14:48:00", channel: "api", respondedBy: "AI", inputTokens: 2110, outputTokens: 544 },
  { id: "r05", createdAt: "2026-11-13T14:41:00", channel: "line", respondedBy: "admin01", inputTokens: 760, outputTokens: 140 },
  { id: "r06", createdAt: "2026-11-13T14:33:00", channel: "line", respondedBy: "AI", inputTokens: 1105, outputTokens: 367 },
  { id: "r07", createdAt: "2026-11-13T14:20:00", channel: "facebook", respondedBy: "AI", inputTokens: 890, outputTokens: 176 },
  { id: "r08", createdAt: "2026-11-13T14:12:00", channel: "api", respondedBy: "AI", inputTokens: 1875, outputTokens: 402 },
  { id: "r09", createdAt: "2026-11-13T13:58:00", channel: "line", respondedBy: "AI", inputTokens: 1330, outputTokens: 291 },
  { id: "r10", createdAt: "2026-11-13T13:40:00", channel: "line", respondedBy: "admin02", inputTokens: 540, outputTokens: 96 },
  { id: "r11", createdAt: "2026-11-13T13:22:00", channel: "facebook", respondedBy: "AI", inputTokens: 1460, outputTokens: 330 },
  { id: "r12", createdAt: "2026-11-13T13:05:00", channel: "api", respondedBy: "AI", inputTokens: 2320, outputTokens: 612 },
];

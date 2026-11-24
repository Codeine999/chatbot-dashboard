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

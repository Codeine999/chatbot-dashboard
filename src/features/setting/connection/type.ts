/** สถานะการเชื่อมต่อ LINE ที่แสดงในการ์ดสถานะ */
export type ConnectionStatus = "idle" | "testing" | "connected" | "failed";

/** ค่าในฟอร์ม ชื่อ field ตรงกับป้ายใน LINE Developers Console */
export type LineCredentials = {
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
};

/** body ของ PUT /admin/line/channel — backend เรียก access token ว่า accessToken */
export type ConnectLineChannelInput = {
  channelId: string;
  channelSecret: string;
  accessToken: string;
};

/** สถานะ channel ของบริษัท ค่าลับไม่ถูกส่งกลับ เหลือแค่ 4 ตัวท้าย */
export type LineChannelState = {
  connected: boolean;
  /** db = เก็บในระบบแล้ว, env = ใช้ค่าจาก server เดิม, none = ยังไม่ตั้งค่า */
  source: "db" | "env" | "none";
  channelKey: string | null;
  channelId: string | null;
  botUserId: string | null;
  basicId: string | null;
  displayName: string | null;
  secretLast4: string | null;
  accessTokenLast4: string | null;
  webhookUrl: string | null;
  verifiedAt: string | null;
  webhookSetAt: string | null;
  updatedAt: string | null;
};

export type LineWebhookSetup = {
  url: string | null;
  ok: boolean;
  reason?: string;
};

export type LineChannelSaveResult = LineChannelState & {
  /** null เมื่อกู้สถานะหลังเน็ตหลุด จึงไม่รู้ผลการตั้ง webhook รอบนั้น */
  webhook: LineWebhookSetup | null;
};

/** ชั้นที่ 1: ค่าที่ LINE Console ใช้อยู่ตอนนี้ */
export type WebhookConfiguredState =
  | "ok"
  | "mismatch"
  | "inactive"
  | "missing"
  | "unknown";

export type WebhookHealth = {
  /** URL ที่ LINE ควรเรียก null เมื่อ backend ยังไม่ได้ตั้ง PUBLIC_API_BASE_URL */
  expectedUrl: string | null;
  configured: {
    state: WebhookConfiguredState;
    endpoint: string | null;
    active: boolean | null;
    /** null = เทียบไม่ได้เพราะไม่รู้ URL ที่คาดหวัง */
    urlMatched: boolean | null;
  };
  /** ชั้นที่ 3: event จริงที่ระบบได้รับ */
  live: { lastEventAt: string | null; eventsLast24h: number };
  checkedAt: string;
};

/** ชั้นที่ 2: LINE ส่ง event ตัวอย่างมาที่ URL ที่ตั้งไว้ */
export type WebhookTestResult = {
  success: boolean;
  statusCode: number | null;
  /** รหัสจาก LINE เช่น OK, COULD_NOT_CONNECT, REQUEST_TIMEOUT, ERROR_STATUS_CODE */
  reason: string;
  detail: string | null;
  testedAt: string;
};

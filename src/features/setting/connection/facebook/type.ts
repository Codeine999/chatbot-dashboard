/** ค่าในฟอร์ม ชื่อ field ตรงกับป้ายใน Meta for Developers */
export type FacebookCredentials = {
  appSecret: string;
  pageAccessToken: string;
};

/** body ของ PUT /admin/facebook/channel */
export type ConnectFacebookChannelInput = FacebookCredentials;

/** สถานะ Page ของบริษัท ค่าลับไม่ถูกส่งกลับ เหลือแค่ 4 ตัวท้าย */
export type FacebookChannelState = {
  connected: boolean;
  /** db = เก็บในระบบแล้ว, env = ใช้ค่าจาก server เดิม, none = ยังไม่ตั้งค่า */
  source: "db" | "env" | "none";
  pageId: string | null;
  pageName: string | null;
  appSecretLast4: string | null;
  pageAccessTokenLast4: string | null;
  /** null เมื่อ backend ยังไม่ได้ตั้ง PUBLIC_API_BASE_URL */
  webhookUrl: string | null;
  verifyToken: string | null;
  verifiedAt: string | null;
  webhookSetAt: string | null;
  updatedAt: string | null;
};

export type FacebookSubscription = {
  ok: boolean;
  reason?: string;
};

export type FacebookChannelSaveResult = FacebookChannelState & {
  /** null เมื่อกู้สถานะหลังเน็ตหลุด จึงไม่รู้ผลการ subscribe รอบนั้น */
  subscription: FacebookSubscription | null;
};

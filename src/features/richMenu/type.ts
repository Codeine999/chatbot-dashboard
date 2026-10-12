/** เมนูที่ยังไม่ได้ส่งขึ้น LINE กับเมนูที่อยู่บน LINE แล้ว แยกกันเพราะแก้ไขได้ไม่เหมือนกัน */
export type RichMenuSource = "draft" | "line";

export type RichMenuStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type RichMenuFilter = "all" | "draft" | "line";

/** ทุกคนเห็นเมนูนี้ หรือส่งให้เฉพาะ user id ที่ใช้ทดสอบ */
export type PublishTarget = "all" | "test";

/**
 * คำตอบที่ร้านเขียนเองสำหรับปุ่มหนึ่งปุ่ม
 *
 * `key` คือชื่อที่ระบบใช้ map — ปุ่มบนเครื่องลูกค้าส่งค่านี้กลับมา จึงเปลี่ยนไม่ได้
 * หลังจากเผยแพร่แล้ว ส่วน `label` คือข้อความที่ลูกค้าอ่านและที่ขึ้นในห้องแชทตอนกด
 */
export type RichMenuReply = {
  id: string;
  key: string;
  label: string;
  replyText: string;
  active: boolean;
  sortOrder: number;
  /** ค่าที่ backend ประกอบให้แล้ว ใช้เทียบกับ area.action.data ได้ตรง ๆ */
  postbackData: string;
  usedByTemplates: { id: string; name: string; status: RichMenuStatus }[];
  updatedAt: string;
};

export type RichMenuReplyDraft = {
  key: string;
  label: string;
  replyText: string;
  active: boolean;
  sortOrder: number;
};

/** สิ่งที่เกิดขึ้นเมื่อลูกค้ากดช่องนี้ — ตอบจากคลังคำตอบ เปิดลิงก์ หรือไม่ทำอะไร */
export type RichMenuButton =
  | { kind: "action"; action: RichMenuArea["action"] }
  | { kind: "reply"; replyKey: string }
  | { kind: "uri"; uri: string }
  | { kind: "none" };

/** รูปหนึ่งใบที่อัปโหลดไว้สำหรับช่องหนึ่งช่อง */
export type RichMenuCellImage = {
  index: number;
  path: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
};

export type RichMenuArea = {
  bounds: { x: number; y: number; width: number; height: number };
  action:
    | {
        type: "postback";
        label?: string;
        data: string;
        displayText?: string;
      }
    | { type: "message"; label?: string; text: string }
    | { type: "uri"; label?: string; uri: string }
    | { type: string; label?: string; [key: string]: unknown };
};

/** รูปแบบที่ backend ส่งกลับมาจาก /admin/rich-menus */
export type RichMenuTemplateDto = {
  id: string;
  tenantId: string | null;
  name: string;
  chatBarText: string;
  width: number;
  height: number;
  selected: boolean;
  areas: RichMenuArea[];
  /** จำนวนช่องที่ backend เก็บไว้ — null คือเมนูเก่าที่ยังไม่เคยตั้งผัง */
  cellCount: number | null;
  cellImages: RichMenuCellImage[];
  imagePath: string | null;
  imageMimeType: string | null;
  imageBytes: number | null;
  status: RichMenuStatus;
  lineRichMenuId: string | null;
  lineAliasId: string | null;
  isDefault: boolean;
  needsRepublish: boolean;
  publishedAt: string | null;
  lastPublishError: string | null;
  updatedAt: string;
};

/** รูปแบบที่หน้าจอใช้ — แบนจาก DTO ให้ทำงานกับ "ช่อง" แทน "area + bounds" */
export type RichMenuCell = {
  index: number;
  /** ข้อความบนปุ่มที่ลูกค้าอ่าน มาจาก reply ที่ผูกไว้ */
  label: string;
  button: RichMenuButton;
  image?: RichMenuCellImage;
};

export type RichMenu = {
  id: string;
  name: string;
  source: RichMenuSource;
  status: RichMenuStatus;
  /** เมนูที่ LINE ใช้เป็นเมนูหลักอยู่ตอนนี้ — มีได้ทีละหนึ่ง */
  active: boolean;
  lineId?: string | null;
  needsRepublish: boolean;
  lastPublishError: string | null;
  /** จำนวนช่องที่เมนูนี้ถูกแบ่ง */
  cells: number;
  cellList: RichMenuCell[];
  /** ภาพรวมที่ backend ประกอบไว้แล้ว พร้อมส่งขึ้น LINE */
  image?: string;
  chatBarText: string;
  width: number;
  height: number;
  updatedAt: string;
};

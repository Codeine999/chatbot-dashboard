/** เมนูที่ยังไม่ได้ส่งขึ้น LINE กับเมนูที่อยู่บน LINE แล้ว แยกกันเพราะแก้ไขได้ไม่เหมือนกัน */
export type RichMenuSource = "draft" | "line";

export type RichMenuActionType = "postback" | "message" | "uri" | "none";

export type RichMenuTemplateId = "grid6" | "grid3" | "split2" | "single";

export type RichMenuFilter = "all" | "draft" | "line";

/** ทุกคนเห็นเมนูนี้ หรือส่งให้เฉพาะ user id ที่ใช้ทดสอบ */
export type PublishTarget = "all" | "test";

export type RichMenuAction = {
  type: RichMenuActionType;
  /** postback — ข้อมูลที่ยิงกลับมาที่ webhook */
  data: string;
  /** message ใช้เป็นตัวข้อความจริง ส่วน postback ใช้เป็น displayText */
  text: string;
  uri: string;
  /** postback เท่านั้น: ให้ข้อความโผล่ในห้องแชทตอนลูกค้ากดหรือไม่ */
  showInChat: boolean;
};

export type RichMenuArea = {
  id: string;
  /** ชื่อที่แอดมินตั้งเอง ใช้อ้างถึงพื้นที่ตอนยังไม่มีภาพ */
  label: string;
  /** พิกัดบนภาพขนาดเต็มตามสเปกของ LINE หน่วยเป็น px */
  bounds: { x: number; y: number; width: number; height: number };
  action: RichMenuAction;
};

export type RichMenu = {
  id: string;
  name: string;
  source: RichMenuSource;
  /** เมนูที่ LINE ใช้เป็นเมนูหลักอยู่ตอนนี้ — มีได้ทีละหนึ่ง */
  active: boolean;
  /** richMenuId ที่ LINE ออกให้ มีเฉพาะเมนูที่เผยแพร่แล้ว */
  lineId?: string;
  template: RichMenuTemplateId;
  /** blob url ตอน preview ในเครื่อง หรือ url จริงเมื่อมี backend */
  image?: string;
  chatBarText: string;
  updatedAt: string;
  areas: RichMenuArea[];
};

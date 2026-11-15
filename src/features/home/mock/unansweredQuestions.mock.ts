export type UnansweredQuestion = {
  id: string;
  question: string;
  /** ชื่อลูกค้าและเวลาที่ส่งต่อให้แอดมิน แสดงเป็นบรรทัดย่อย */
  meta: string;
};

/** ข้อมูลตัวอย่างเมื่อยังไม่มี API คำถามที่ AI ตอบไม่ได้ */
export const UNANSWERED_QUESTIONS_MOCK: UnansweredQuestion[] = [
  { id: "mock-1", question: "ขอข้อมูล นวดกดจุด", meta: "Nampun · ส่งต่อแอดมิน 14:55" },
  { id: "mock-2", question: "ปวดเมื่อยทำยังไง", meta: "Nampun · ส่งต่อแอดมิน 14:51" },
  { id: "mock-3", question: "[คำถามจากข้อมูลจริง]", meta: "[ชื่อลูกค้า · เวลา]" },
  { id: "mock-4", question: "[คำถามจากข้อมูลจริง]", meta: "[ชื่อลูกค้า · เวลา]" },
];

/** จำนวนรายการที่แสดงในการ์ดได้ */
export const UNANSWERED_QUESTIONS_LIMIT = 4;

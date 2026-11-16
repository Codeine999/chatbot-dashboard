export type UnansweredQuestion = {
  id: string;
  question: string;
  /** ชื่อลูกค้าและเวลาที่ส่งต่อให้แอดมิน แสดงเป็นบรรทัดย่อย */
  meta: string;
};

/** ข้อมูลตัวอย่างทั้งหมดของการ์ด (ยังไม่มี API) รูปแบบ: ส่งโดย … · คำถาม … ? */
export const UNANSWERED_QUESTIONS_MOCK: UnansweredQuestion[] = [
  { id: "mock-1", question: "คำถาม ... ?", meta: "ส่งโดย ... · ส่งต่อแอดมิน ..:.." },
  { id: "mock-2", question: "คำถาม ... ?", meta: "ส่งโดย ... · ส่งต่อแอดมิน ..:.." },
  { id: "mock-3", question: "คำถาม ... ?", meta: "ส่งโดย ... · ส่งต่อแอดมิน ..:.." },
  { id: "mock-4", question: "คำถาม ... ?", meta: "ส่งโดย ... · ส่งต่อแอดมิน ..:.." },
];

/** จำนวนรายการที่แสดงในการ์ดได้ */
export const UNANSWERED_QUESTIONS_LIMIT = 4;

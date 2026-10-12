/** หนึ่งแถวของ micro knowledge หลัง map ให้ field ไม่เป็น null แล้ว */
export type MicroKnowledgeItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  intentKey: string;
  /** สินค้า/เอนทิตีที่ความรู้ชิ้นนี้พูดถึง */
  entityKey: string;
  /** หัวข้อย่อยของเอนทิตีนั้น เช่น price, warranty */
  topicKey: string;
  keywords: string[];
  questionExamples: string[];
  answer: string;
  /** ค่าจาก backend เช่น "th" ไม่ต้องแปล */
  language: string;
  priority: number;
  active: boolean;
  /** ISO string */
  createdAt: string;
  /** ISO string */
  updatedAt: string;
};

export type MicroKnowledgeCount = {
  total: number;
  active: number;
};

/** Raw model ที่ /api/admin/knowledge-micro ส่งกลับมา */
export type MicroKnowledgeDto = {
  id: string;
  tenantId?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  intentKey?: string | null;
  entityKey?: string | null;
  topicKey?: string | null;
  keywords?: string[] | string | null;
  questionExamples?: string[] | string | null;
  answer?: string | null;
  language?: string | null;
  priority?: number | null;
  active?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MicroKnowledgeListResponse =
  | MicroKnowledgeDto[]
  | {
      data?: MicroKnowledgeDto[] | { items?: MicroKnowledgeDto[] };
      items?: MicroKnowledgeDto[];
      result?: MicroKnowledgeDto[];
    };

/** ข้อมูลที่ฟอร์มแก้ไขได้ ไม่รวม field ที่ระบบกำหนดเอง */
export type MicroKnowledgeDraft = Omit<
  MicroKnowledgeItem,
  "id" | "createdAt" | "updatedAt"
>;

/** Body ของ POST /api/admin/knowledge-micro */
export type CreateMicroKnowledgePayload = {
  title: string;
  description?: string | null;
  category?: string | null;
  intentKey?: string | null;
  entityKey?: string | null;
  topicKey?: string | null;
  keywords: string[];
  questionExamples: string[];
  answer: string;
  language: string;
  priority: number;
  active: boolean;
};

/** Body ของ PATCH /api/admin/knowledge-micro/:id — ทุก field เป็น optional */
export type UpdateMicroKnowledgePayload = {
  title?: string;
  description?: string | null;
  category?: string | null;
  intentKey?: string | null;
  entityKey?: string | null;
  topicKey?: string | null;
  /** ใช้แทนรายการเดิมทั้งชุด และห้ามส่งพร้อม addKeywords/removeKeywords */
  keywords?: string[];
  addKeywords?: string[];
  removeKeywords?: string[];
  questionExamples?: string[];
  answer?: string;
  language?: string;
  priority?: number;
  active?: boolean;
};

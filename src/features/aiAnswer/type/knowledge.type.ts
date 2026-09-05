export type KnowledgeItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  intentKey: string;
  keywords: string[];
  questionExamples: string[];
  answer: string;
  priority: number;
  active: boolean;
  /** ISO string */
  updatedAt: string;
};

export type SysCategory = {
  id: string;
  name: string;
};

export type SysCategoryList = {
  total: number;
  data: SysCategory[];
};

export type AnswerPatternCount = {
  total: number;
  active: number;
};

/** Raw model returned by the answer-pattern API. */
export type AnswerPatternDto = {
  id: string;
  tenantId?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  intentKey?: string | null;
  key?: string | null;
  keywords?: string[] | string | null;
  questionExamples?: string[] | string | null;
  examples?: string[] | string | null;
  answer?: string | null;
  response?: string | null;
  language?: string | null;
  priority?: number | null;
  active?: boolean | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AnswerPatternListResponse =
  | AnswerPatternDto[]
  | {
      data?: AnswerPatternDto[] | { items?: AnswerPatternDto[] };
      items?: AnswerPatternDto[];
      result?: AnswerPatternDto[];
    };

/** ข้อมูลที่ฟอร์มแก้ไขได้ ไม่รวม field ที่ระบบกำหนดเอง */
export type KnowledgeDraft = Omit<KnowledgeItem, "id" | "updatedAt">;

/** Body ของ PATCH /api/admin/answer-patterns/:id — ทุก field เป็น optional */
export type UpdateAnswerPatternPayload = {
  title?: string;
  description?: string | null;
  category?: string | null;
  intentKey?: string | null;
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

export type KnowledgeStats = {
  total: number;
  active: number;
  categories: number;
};

export type RetrievalMatch = {
  id: string;
  title: string;
  intentKey: string;
  priority: number;
  /** 0-100 */
  score: number;
};

export type KnowledgeFilters = {
  search: string;
  category: string;
  status: "all" | "active" | "inactive";
  priority: "all" | "high" | "medium" | "low";
};

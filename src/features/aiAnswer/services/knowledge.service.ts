import { api } from "@/api/api";
import type {
  AnswerPatternDto,
  AnswerPatternCount,
  AnswerPatternListResponse,
  KnowledgeDraft,
  KnowledgeItem,
  RetrievalMatch,
  SysCategory,
  SysCategoryList,
  UpdateAnswerPatternPayload,
} from "../type/knowledge.type";

export const ANSWER_PATTERN_ENDPOINTS = {
  list: "/admin/answer-patterns",
  count: "/admin/answer-patterns/count",
  create: "/admin/answer-patterns",
  update: (id: string) => `/admin/answer-patterns/${id}`,
  remove: (id: string) => `/admin/answer-patterns/${id}`,
  retrieve: "/admin/answer-patterns/retrieve",
  categories: "/admin/knowledge/categories",
  removeCategory: (id: string) => `/admin/knowledge/categories/${id}`,
} as const;

const toStringArray = (value: string[] | string | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }

  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.trim() !== ""
      );
    }
  } catch {
    // Plain comma/newline-separated values are supported as a fallback.
  }

  return value
    .split(/,|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const mapAnswerPattern = (item: AnswerPatternDto): KnowledgeItem => ({
  id: item.id,
  title: item.title ?? item.name ?? item.intentKey ?? "Untitled pattern",
  description: item.description ?? "",
  category: item.category ?? "Uncategorized",
  intentKey: item.intentKey ?? item.key ?? "",
  keywords: toStringArray(item.keywords),
  questionExamples: toStringArray(item.questionExamples ?? item.examples),
  answer: item.answer ?? item.response ?? "",
  priority: Number.isFinite(Number(item.priority)) ? Number(item.priority) : 50,
  active: item.active ?? item.isActive ?? true,
  updatedAt: item.updatedAt ?? item.createdAt ?? new Date(0).toISOString(),
});

const extractItems = (payload: AnswerPatternListResponse): AnswerPatternDto[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
};

const toPayload = (draft: KnowledgeDraft) => ({
  title: draft.title.trim(),
  description: draft.description.trim(),
  category: draft.category.trim(),
  intentKey: draft.intentKey.trim(),
  keywords: draft.keywords.map((value) => value.trim()),
  questionExamples: draft.questionExamples.map((value) => value.trim()),
  answer: draft.answer.trim(),
  priority: draft.priority,
  active: draft.active,
});

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

/**
 * สร้าง PATCH จากค่าที่เปลี่ยนจริงเท่านั้น เพื่อไม่ให้ field ที่ไม่ได้แก้ถูก reset
 * ส่วน keywords ใช้ add/remove ตาม contract ของ backend แทนการ replace ทั้งชุด
 */
export const buildAnswerPatternPatch = (
  original: KnowledgeItem,
  draft: KnowledgeDraft
): UpdateAnswerPatternPayload => {
  const next = toPayload(draft);
  const patch: UpdateAnswerPatternPayload = {};

  if (next.title !== original.title) patch.title = next.title;
  if (next.description !== original.description) patch.description = next.description;
  if (next.category !== original.category) patch.category = next.category;
  if (next.intentKey !== original.intentKey) patch.intentKey = next.intentKey;
  if (!arraysEqual(next.questionExamples, original.questionExamples)) {
    patch.questionExamples = next.questionExamples;
  }
  if (next.answer !== original.answer) patch.answer = next.answer;
  if (next.priority !== original.priority) patch.priority = next.priority;
  if (next.active !== original.active) patch.active = next.active;

  const addKeywords = next.keywords.filter(
    (keyword) => !original.keywords.includes(keyword)
  );
  const removeKeywords = original.keywords.filter(
    (keyword) => !next.keywords.includes(keyword)
  );

  if (addKeywords.length) patch.addKeywords = addKeywords;
  if (removeKeywords.length) patch.removeKeywords = removeKeywords;

  return patch;
};

export const hasAnswerPatternChanges = (
  original: KnowledgeItem,
  draft: KnowledgeDraft
) => Object.keys(buildAnswerPatternPatch(original, draft)).length > 0;

const extractItem = (
  payload: AnswerPatternDto | { data?: AnswerPatternDto }
): AnswerPatternDto => {
  if ("id" in payload) return payload;
  if (payload.data) return payload.data;

  throw new Error("Answer pattern response is missing data");
};

export const knowledgeApi = {
  getCategories: async (): Promise<SysCategoryList> => {
    const response = await api.get<
      SysCategory[] | { total?: number; data?: SysCategory[] }
    >(
      ANSWER_PATTERN_ENDPOINTS.categories
    );
    const payload = response.data;

    if (Array.isArray(payload)) {
      return { total: payload.length, data: payload };
    }

    const categories = Array.isArray(payload.data) ? payload.data : [];
    return {
      total: Number.isFinite(Number(payload.total))
        ? Number(payload.total)
        : categories.length,
      data: categories,
    };
  },

  createCategory: async (name: string): Promise<SysCategory> => {
    const response = await api.post<SysCategory>(
      ANSWER_PATTERN_ENDPOINTS.categories,
      { name }
    );
    return response.data;
  },

  removeCategory: async (id: string): Promise<void> => {
    await api.delete(ANSWER_PATTERN_ENDPOINTS.removeCategory(id));
  },

  getAll: async (): Promise<KnowledgeItem[]> => {
    const response = await api.get<AnswerPatternListResponse>(
      ANSWER_PATTERN_ENDPOINTS.list
    );
    return extractItems(response.data).map(mapAnswerPattern);
  },

  getCount: async (): Promise<AnswerPatternCount> => {
    const response = await api.get<AnswerPatternCount>(
      ANSWER_PATTERN_ENDPOINTS.count
    );
    return response.data;
  },

  create: async (draft: KnowledgeDraft): Promise<KnowledgeItem> => {
    const response = await api.post<AnswerPatternDto | { data?: AnswerPatternDto }>(
      ANSWER_PATTERN_ENDPOINTS.create,
      toPayload(draft)
    );
    return mapAnswerPattern(extractItem(response.data));
  },

  update: async (
    id: string,
    payload: UpdateAnswerPatternPayload
  ): Promise<KnowledgeItem> => {
    const response = await api.patch<AnswerPatternDto | { data?: AnswerPatternDto }>(
      ANSWER_PATTERN_ENDPOINTS.update(id),
      payload
    );
    return mapAnswerPattern(extractItem(response.data));
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(ANSWER_PATTERN_ENDPOINTS.remove(id));
  },

  retrieve: async (question: string): Promise<RetrievalMatch[]> => {
    const response = await api.post<RetrievalMatch[]>(
      ANSWER_PATTERN_ENDPOINTS.retrieve,
      { question }
    );
    return response.data;
  },
};

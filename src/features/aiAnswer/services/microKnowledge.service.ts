import { api } from "@/api/api";
import { toStringArray } from "./knowledge.service";
import type {
  CreateMicroKnowledgePayload,
  MicroKnowledgeCount,
  MicroKnowledgeDraft,
  MicroKnowledgeDto,
  MicroKnowledgeItem,
  MicroKnowledgeListResponse,
  UpdateMicroKnowledgePayload,
} from "../type/microKnowledge.type";

export const MICRO_KNOWLEDGE_ENDPOINTS = {
  list: "/admin/knowledge-micro",
  count: "/admin/knowledge-micro/count",
  create: "/admin/knowledge-micro",
  update: (id: string) => `/admin/knowledge-micro/${id}`,
  remove: (id: string) => `/admin/knowledge-micro/${id}`,
  reindex: "/admin/knowledge-micro/reindex",
} as const;

export const DEFAULT_MICRO_KNOWLEDGE_LANGUAGE = "th";

export const mapMicroKnowledge = (
  item: MicroKnowledgeDto
): MicroKnowledgeItem => ({
  id: item.id,
  title: item.title ?? "",
  description: item.description ?? "",
  category: item.category ?? "",
  intentKey: item.intentKey ?? "",
  entityKey: item.entityKey ?? "",
  topicKey: item.topicKey ?? "",
  keywords: toStringArray(item.keywords),
  questionExamples: toStringArray(item.questionExamples),
  answer: item.answer ?? "",
  language: item.language ?? DEFAULT_MICRO_KNOWLEDGE_LANGUAGE,
  priority: Number.isFinite(Number(item.priority)) ? Number(item.priority) : 0,
  active: item.active ?? true,
  createdAt: item.createdAt ?? new Date(0).toISOString(),
  updatedAt: item.updatedAt ?? item.createdAt ?? new Date(0).toISOString(),
});

const extractItems = (
  payload: MicroKnowledgeListResponse
): MicroKnowledgeDto[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
};

const extractItem = (
  payload: MicroKnowledgeDto | { data?: MicroKnowledgeDto }
): MicroKnowledgeDto => {
  if ("id" in payload) return payload;
  if (payload.data) return payload.data;

  throw new Error("Micro knowledge response is missing data");
};

/** field ที่ backend รับเป็น nullable ถ้าเว้นว่างให้ส่ง null แทนสตริงว่าง */
const orNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const toMicroKnowledgePayload = (
  draft: MicroKnowledgeDraft
): CreateMicroKnowledgePayload => ({
  title: draft.title.trim(),
  description: orNull(draft.description),
  category: orNull(draft.category),
  intentKey: orNull(draft.intentKey),
  entityKey: orNull(draft.entityKey),
  topicKey: orNull(draft.topicKey),
  keywords: draft.keywords.map((value) => value.trim()).filter(Boolean),
  questionExamples: draft.questionExamples
    .map((value) => value.trim())
    .filter(Boolean),
  answer: draft.answer.trim(),
  language: draft.language.trim() || DEFAULT_MICRO_KNOWLEDGE_LANGUAGE,
  priority: draft.priority,
  active: draft.active,
});

/**
 * สร้าง PATCH จากค่าที่เปลี่ยนจริงเท่านั้น เพื่อไม่ให้ field ที่ไม่ได้แก้ถูก reset
 * ส่วน keywords ใช้ add/remove ตาม contract ของ backend แทนการ replace ทั้งชุด
 */
export const buildMicroKnowledgePatch = (
  original: MicroKnowledgeItem,
  draft: MicroKnowledgeDraft
): UpdateMicroKnowledgePayload => {
  const next = toMicroKnowledgePayload(draft);
  const patch: UpdateMicroKnowledgePayload = {};

  if (next.title !== original.title) patch.title = next.title;
  if ((next.description ?? "") !== original.description) {
    patch.description = next.description;
  }
  if ((next.category ?? "") !== original.category) patch.category = next.category;
  if ((next.intentKey ?? "") !== original.intentKey) patch.intentKey = next.intentKey;
  if ((next.entityKey ?? "") !== original.entityKey) patch.entityKey = next.entityKey;
  if ((next.topicKey ?? "") !== original.topicKey) patch.topicKey = next.topicKey;
  if (!arraysEqual(next.questionExamples, original.questionExamples)) {
    patch.questionExamples = next.questionExamples;
  }
  if (next.answer !== original.answer) patch.answer = next.answer;
  if (next.language !== original.language) patch.language = next.language;
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

export const hasMicroKnowledgeChanges = (
  original: MicroKnowledgeItem,
  draft: MicroKnowledgeDraft
) => Object.keys(buildMicroKnowledgePatch(original, draft)).length > 0;

export const microKnowledgeApi = {
  getAll: async (): Promise<MicroKnowledgeItem[]> => {
    const response = await api.get<MicroKnowledgeListResponse>(
      MICRO_KNOWLEDGE_ENDPOINTS.list
    );
    return extractItems(response.data).map(mapMicroKnowledge);
  },

  getCount: async (): Promise<MicroKnowledgeCount> => {
    const response = await api.get<MicroKnowledgeCount>(
      MICRO_KNOWLEDGE_ENDPOINTS.count
    );
    return response.data;
  },

  create: async (draft: MicroKnowledgeDraft): Promise<MicroKnowledgeItem> => {
    const response = await api.post<
      MicroKnowledgeDto | { data?: MicroKnowledgeDto }
    >(MICRO_KNOWLEDGE_ENDPOINTS.create, toMicroKnowledgePayload(draft));
    return mapMicroKnowledge(extractItem(response.data));
  },

  update: async (
    id: string,
    payload: UpdateMicroKnowledgePayload
  ): Promise<MicroKnowledgeItem> => {
    const response = await api.patch<
      MicroKnowledgeDto | { data?: MicroKnowledgeDto }
    >(MICRO_KNOWLEDGE_ENDPOINTS.update(id), payload);
    return mapMicroKnowledge(extractItem(response.data));
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(MICRO_KNOWLEDGE_ENDPOINTS.remove(id));
  },
};

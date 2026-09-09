import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import {
  buildAnswerPatternPatch,
  knowledgeApi,
} from "../services/knowledge.service";
import type {
  KnowledgeDraft,
  KnowledgeItem,
  KnowledgeStats,
  SysCategoryList,
} from "../type/knowledge.type";

export const knowledgeKeys = {
  all: ["answer-patterns"] as const,
  list: () => [...knowledgeKeys.all, "list"] as const,
  count: () => [...knowledgeKeys.all, "count"] as const,
  categories: () => [...knowledgeKeys.all, "categories"] as const,
};

export function useKnowledgeCount() {
  return useQuery({
    queryKey: knowledgeKeys.count(),
    queryFn: knowledgeApi.getCount,
    staleTime: 30 * 1000,
  });
}

export function useKnowledgeCategories() {
  return useQuery({
    queryKey: knowledgeKeys.categories(),
    queryFn: knowledgeApi.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateKnowledgeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.createCategory,
    onSuccess: (created) => {
      queryClient.setQueryData<SysCategoryList>(
        knowledgeKeys.categories(),
        (current) => {
          const categories = [
            ...(current?.data ?? []).filter(
              (category) => category.id !== created.id
            ),
            created,
          ].sort((left, right) => left.name.localeCompare(right.name));

          return { total: categories.length, data: categories };
        }
      );
      toast.success(i18n.t("knowledge:toast.categoryAdded"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("knowledge:toast.categoryAddFailed")));
    },
  });
}

export function useDeleteKnowledgeCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.removeCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.categories() });
      toast.success(i18n.t("knowledge:toast.categoryDeleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("knowledge:toast.categoryDeleteFailed")));
    },
  });
}

export function useKnowledgeList() {
  return useQuery({
    queryKey: knowledgeKeys.list(),
    queryFn: knowledgeApi.getAll,
    staleTime: 30 * 1000,
  });
}

/** สร้างเมื่อไม่มี id, แก้ไขเมื่อมี id */
export function useSaveKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      original,
      draft,
    }: {
      id?: string;
      original?: KnowledgeItem;
      draft: KnowledgeDraft;
    }) => {
      if (id) {
        if (!original) throw new Error("Original answer pattern is required for PATCH");

        const patch = buildAnswerPatternPatch(original, draft);
        if (Object.keys(patch).length === 0) return original;

        return knowledgeApi.update(id, patch);
      }

      return knowledgeApi.create(draft);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list() });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.count() });
      toast.success(variables.id ? i18n.t("knowledge:toast.updated") : i18n.t("knowledge:toast.created"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("knowledge:toast.saveFailed")));
    },
  });
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list() });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.count() });
      toast.success(i18n.t("knowledge:toast.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("knowledge:toast.deleteFailed")));
    },
  });
}

export function useRetrievalTest() {
  return useMutation({
    mutationFn: (question: string) => knowledgeApi.retrieve(question),
  });
}

export function useKnowledgeStats(): KnowledgeStats {
  const { data: answerPatternCount } = useKnowledgeCount();
  const { data: categoryList } = useKnowledgeCategories();

  return {
    total: answerPatternCount?.total ?? 0,
    active: answerPatternCount?.active ?? 0,
    categories: categoryList?.total ?? 0,
  };
}

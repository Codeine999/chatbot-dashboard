import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import {
  buildMicroKnowledgePatch,
  microKnowledgeApi,
} from "../services/microKnowledge.service";
import type {
  MicroKnowledgeDraft,
  MicroKnowledgeItem,
} from "../type/microKnowledge.type";
import type { KnowledgeStats } from "../type/knowledge.type";
import { useKnowledgeCategories } from "./useKnowledge";

export const microKnowledgeKeys = {
  all: ["knowledge-micro"] as const,
  list: () => [...microKnowledgeKeys.all, "list"] as const,
  count: () => [...microKnowledgeKeys.all, "count"] as const,
};

export function useMicroKnowledgeList() {
  return useQuery({
    queryKey: microKnowledgeKeys.list(),
    queryFn: microKnowledgeApi.getAll,
    staleTime: 30 * 1000,
  });
}

export function useMicroKnowledgeCount() {
  return useQuery({
    queryKey: microKnowledgeKeys.count(),
    queryFn: microKnowledgeApi.getCount,
    staleTime: 30 * 1000,
  });
}

/** สร้างเมื่อไม่มี id, แก้ไขเมื่อมี id */
export function useSaveMicroKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      original,
      draft,
    }: {
      id?: string;
      original?: MicroKnowledgeItem;
      draft: MicroKnowledgeDraft;
    }) => {
      if (id) {
        if (!original) throw new Error("Original micro knowledge is required for PATCH");

        const patch = buildMicroKnowledgePatch(original, draft);
        if (Object.keys(patch).length === 0) return original;

        return microKnowledgeApi.update(id, patch);
      }

      return microKnowledgeApi.create(draft);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: microKnowledgeKeys.list() });
      queryClient.invalidateQueries({ queryKey: microKnowledgeKeys.count() });
      toast.success(
        variables.id
          ? i18n.t("knowledge:toast.updated")
          : i18n.t("knowledge:toast.created")
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("knowledge:toast.saveFailed")));
    },
  });
}

export function useDeleteMicroKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => microKnowledgeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: microKnowledgeKeys.list() });
      queryClient.invalidateQueries({ queryKey: microKnowledgeKeys.count() });
      toast.success(i18n.t("knowledge:toast.deleted"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("knowledge:toast.deleteFailed")));
    },
  });
}

/** การ์ดสถิติด้านบนใช้ component เดียวกับ Knowledge Entries จึงคืนรูปแบบเดียวกัน */
export function useMicroKnowledgeStats(): KnowledgeStats {
  const { data: count } = useMicroKnowledgeCount();
  const { data: categoryList } = useKnowledgeCategories();

  return {
    total: count?.total ?? 0,
    active: count?.active ?? 0,
    categories: categoryList?.total ?? 0,
  };
}

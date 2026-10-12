import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";

import { richMenuApi } from "../services/richMenu.service";
import { richMenuReplyApi } from "../services/richMenuReply.service";
import type { RichMenuButton, RichMenuReplyDraft } from "../type";

export const richMenuKeys = {
  all: ["rich-menu"] as const,
  menus: () => [...richMenuKeys.all, "menus"] as const,
  replies: () => [...richMenuKeys.all, "replies"] as const,
};

const fail = (error: unknown) => toast.error(getApiErrorMessage(error));

export function useRichMenus() {
  return useQuery({
    queryKey: richMenuKeys.menus(),
    queryFn: richMenuApi.getAll,
    staleTime: 30 * 1000,
  });
}

export function useRichMenuReplies() {
  return useQuery({
    queryKey: richMenuKeys.replies(),
    queryFn: richMenuReplyApi.getAll,
    staleTime: 30 * 1000,
  });
}

/**
 * ทุก mutation ของเมนูคืนเมนูที่อัปเดตแล้วมาให้ จึงเขียนทับ cache ได้เลย
 * ไม่ต้องยิง list ใหม่ — สำคัญกับการอัปโหลดรูป เพราะ backend ประกอบภาพรวม
 * ใหม่ทุกครั้ง และหน้าจอต้องเห็นภาพใหม่ทันทีโดยไม่กระพริบ
 */
function useMenuMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
  options: { successKey?: string } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: richMenuKeys.menus() });
      if (options.successKey) toast.success(i18n.t(options.successKey));
    },
    onError: fail,
  });
}

export function useCreateRichMenu() {
  return useMenuMutation(
    ({ name, chatBarText }: { name: string; chatBarText: string }) =>
      richMenuApi.create(name, chatBarText),
    { successKey: "richMenu:toast.created" }
  );
}

export function useRenameRichMenu() {
  return useMenuMutation(
    ({
      id,
      ...patch
    }: {
      id: string;
      name?: string;
      chatBarText?: string;
    }) => richMenuApi.rename(id, patch)
  );
}

export function useSaveRichMenuLayout() {
  return useMenuMutation(
    ({
      id,
      cells,
      buttons,
    }: {
      id: string;
      cells: number;
      buttons: RichMenuButton[];
    }) => richMenuApi.saveLayout(id, cells, buttons),
    { successKey: "richMenu:toast.draftSaved" }
  );
}

export function useUploadCellImage() {
  return useMenuMutation(
    ({ id, index, file }: { id: string; index: number; file: File }) =>
      richMenuApi.uploadCellImage(id, index, file)
  );
}

export function useRemoveCellImage() {
  return useMenuMutation(({ id, index }: { id: string; index: number }) =>
    richMenuApi.removeCellImage(id, index)
  );
}

export function useDeleteRichMenu() {
  return useMenuMutation(({ id }: { id: string }) => richMenuApi.remove(id), {
    successKey: "richMenu:toast.deleted",
  });
}

export function usePublishRichMenu() {
  return useMenuMutation(
    ({
      id,
      target,
      testUserId,
    }: {
      id: string;
      target: "all" | "test";
      testUserId?: string;
    }) => richMenuApi.publish(id, target, testUserId),
    { successKey: "richMenu:toast.published" }
  );
}

function useReplyMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
  successKey: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: richMenuKeys.replies() });
      // คำตอบที่เปลี่ยนชื่อปุ่มมีผลกับ label บนเมนูด้วย
      queryClient.invalidateQueries({ queryKey: richMenuKeys.menus() });
      toast.success(i18n.t(successKey));
    },
    onError: fail,
  });
}

export function useCreateRichMenuReply() {
  return useReplyMutation(
    (draft: RichMenuReplyDraft) => richMenuReplyApi.create(draft),
    "richMenu:toast.replyCreated"
  );
}

export function useUpdateRichMenuReply() {
  return useReplyMutation(
    ({
      id,
      ...patch
    }: { id: string } & Partial<Omit<RichMenuReplyDraft, "key">>) =>
      richMenuReplyApi.update(id, patch),
    "richMenu:toast.replyUpdated"
  );
}

export function useDeleteRichMenuReply() {
  return useReplyMutation(
    ({ id }: { id: string }) => richMenuReplyApi.remove(id),
    "richMenu:toast.replyDeleted"
  );
}

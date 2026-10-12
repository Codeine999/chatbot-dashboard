import { api } from "@/api/api";

import type { RichMenuReply, RichMenuReplyDraft } from "../type";

export const RICH_MENU_REPLY_ENDPOINTS = {
  list: "/admin/rich-menu-replies",
  create: "/admin/rich-menu-replies",
  update: (id: string) => `/admin/rich-menu-replies/${id}`,
  remove: (id: string) => `/admin/rich-menu-replies/${id}`,
} as const;

export const richMenuReplyApi = {
  async getAll(): Promise<RichMenuReply[]> {
    const { data } = await api.get<RichMenuReply[]>(
      RICH_MENU_REPLY_ENDPOINTS.list
    );

    return data;
  },

  async create(draft: RichMenuReplyDraft): Promise<RichMenuReply> {
    const { data } = await api.post<RichMenuReply>(
      RICH_MENU_REPLY_ENDPOINTS.create,
      {
        key: draft.key.trim().toLowerCase(),
        label: draft.label.trim(),
        replyText: draft.replyText.trim(),
        active: draft.active,
        sortOrder: draft.sortOrder,
      }
    );

    return data;
  },

  /** `key` ส่งไม่ได้: ปุ่มที่เผยแพร่ไปแล้วอ้างค่าเดิมอยู่บนเครื่องลูกค้า */
  async update(
    id: string,
    patch: Partial<Omit<RichMenuReplyDraft, "key">>
  ): Promise<RichMenuReply> {
    const { data } = await api.patch<RichMenuReply>(
      RICH_MENU_REPLY_ENDPOINTS.update(id),
      patch
    );

    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(RICH_MENU_REPLY_ENDPOINTS.remove(id));
  },
};

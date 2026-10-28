import { api } from "@/api/api";
import type { AdminAccount, CreateAdminPayload } from "../type";

export const ADMIN_LIST_ENDPOINTS = {
  /** เปิดให้เฉพาะ dev กับ owner — role admin จะได้ 403 */
  list: "/admin/all",
  /** เฉพาะ dev กับ owner — บัญชีใหม่เข้าบริษัทเดียวกับผู้สร้าง */
  create: "/admin",
} as const;

type AdminListResponse =
  | AdminAccount[]
  | { data?: AdminAccount[]; items?: AdminAccount[]; result?: AdminAccount[] };

const extractItems = (payload: AdminListResponse): AdminAccount[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
};

export const adminListApi = {
  getAll: async (): Promise<AdminAccount[]> => {
    const response = await api.get<AdminListResponse>(ADMIN_LIST_ENDPOINTS.list);
    return extractItems(response.data);
  },

  create: async (payload: CreateAdminPayload): Promise<void> => {
    await api.post(ADMIN_LIST_ENDPOINTS.create, payload);
  },
};

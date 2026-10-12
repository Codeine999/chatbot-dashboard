import { api } from "@/api/api";
import type { AdminAccount } from "../type";

export const ADMIN_LIST_ENDPOINTS = {
  /** เปิดให้เฉพาะ dev กับ owner — role admin จะได้ 403 */
  list: "/admin/all",
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
};

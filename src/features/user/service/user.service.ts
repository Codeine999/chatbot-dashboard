import { api } from "@/api/api";
import type { UserItem } from "../type";

type UsersResponse =
  | UserItem[]
  | {
      data?: UserItem[] | { users?: UserItem[] };
      users?: UserItem[];
      result?: UserItem[];
    };

export const usersApi = {
  getAll: async (): Promise<UserItem[]> => {
    const res = await api.post<UsersResponse>("/users/getall");
    const payload = res.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data?.users)) return payload.data.users;
    if (Array.isArray(payload.users)) return payload.users;
    if (Array.isArray(payload.result)) return payload.result;

    return [];
  },
};

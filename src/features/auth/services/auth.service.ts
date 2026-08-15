import { api } from "@/api/api";
import type { LoginPayload, LoginResponse } from "../types/auth.type";

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/admin/auth/login", payload);
    return res.data;
  },
};

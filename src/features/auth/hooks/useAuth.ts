import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/api/api";
import { authApi } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { FromLocationState, LoginPayload } from "../types/auth.type";

export const authKeys = {
  all: ["auth"] as const,
  login: () => [...authKeys.all, "login"] as const,
};

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const mutation = useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data);
      // ล้าง cache ของ user เดิม กันข้อมูลข้ามบัญชี
      queryClient.clear();
      // กลับไปหน้าที่ ProtectedRoute กันไว้ก่อนหน้านี้ ถ้าไม่มีก็ไปหน้าแรก
      const from = (location.state as FromLocationState | null)?.from;
      navigate(from ?? "/", { replace: true });
    },
  });

  return {
    ...mutation,
    errorMessage: mutation.error
      ? getApiErrorMessage(mutation.error, "Username or password is incorrect")
      : "",
  };
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return () => {
    clearAuth();
    queryClient.clear();
    navigate("/login", { replace: true });
  };
}

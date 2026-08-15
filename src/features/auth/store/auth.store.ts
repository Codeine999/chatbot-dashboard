import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, LoginResponse } from "../types/auth.type";

/** key ของ localStorage ที่เก็บ token + user */
export const AUTH_STORAGE_KEY = "auth";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (payload: LoginResponse) => void;
  clearAuth: () => void;
};

const toAuthUser = (admin: LoginResponse["admin"]): AuthUser => ({
  id: admin.id,
  username: admin.username,
  firstname: admin.firstname,
  lastname: admin.lastname,
  email: admin.email,
  role: admin.role,
  image: admin.image ?? "",
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: ({ accessToken, admin }) =>
        set({ token: accessToken, user: toAuthUser(admin) }),

      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

/* ---------- selectors: ใช้ใน component เพื่อลด re-render ---------- */

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () =>
  useAuthStore((state) => Boolean(state.token));

/* ---------- helpers: ใช้นอก React (axios interceptor ฯลฯ) ---------- */

export const getAuthToken = () => useAuthStore.getState().token;
export const setAuth = (payload: LoginResponse) =>
  useAuthStore.getState().setAuth(payload);
export const clearAuth = () => useAuthStore.getState().clearAuth();

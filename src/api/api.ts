import axios from "axios";
import { clearAuth, getAuthToken } from "@/features/auth/store/auth.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // handle common error here
    // เช่น 401 logout, 403 redirect, etc.
    if (error.response?.status === 401) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

/** ดึงข้อความ error จาก response ของ backend มาแสดงบน UI */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong, please try again"
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string | string[];
          error?: string;
          errors?: { message?: string }[];
        }
      | undefined;

    // validation error: { message: "Validation failed", errors: [{ message }] }
    if (data?.errors?.length) return data.errors[0]?.message ?? fallback;
    if (Array.isArray(data?.message)) return data.message[0] ?? fallback;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.code === "ECONNABORTED") return "Request timeout";
    if (!error.response) return "Cannot connect to server";
  }

  return fallback;
};

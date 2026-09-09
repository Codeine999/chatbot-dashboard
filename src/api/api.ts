import axios from "axios";
import { clearAuth, getAuthToken } from "@/features/auth/store/auth.store";
import i18n, { getCurrentLanguage } from "@/i18n";

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

  // ส่งภาษาปัจจุบันไปด้วยทุก request เผื่อ backend ตอบ error/เนื้อหาตามภาษาได้
  // ตอนนี้ backend ยังไม่อ่าน header นี้ แต่ใส่ไว้ก่อนจะได้ไม่ต้องแก้ทีหลัง
  config.headers["Accept-Language"] = getCurrentLanguage();

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
  // อ่านค่า default ตอนเรียกฟังก์ชัน ไม่ใช่ตอน import ข้อความจึงตรงกับภาษาปัจจุบันเสมอ
  fallback = i18n.t("state.error")
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
    if (error.code === "ECONNABORTED") return i18n.t("state.timeout");
    if (!error.response) return i18n.t("state.offline");
  }

  return fallback;
};

import axios from "axios";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";

/** request ไม่ได้คำตอบจาก server (เน็ตหลุด, timeout) — server อาจบันทึกไปแล้ว */
export const isTransportError = (error: unknown) =>
  axios.isAxiosError(error) && !error.response;

export const isForbiddenError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 403;

const MESSAGE_KEY_BY_STATUS: Record<number, string> = {
  400: "invalidToken",
  403: "ownerOnly",
  409: "conflict",
  502: "lineUnreachable",
  503: "notReady",
};

/** แปลง error ของ PUT เป็นข้อความที่เจ้าของร้านทำตามได้ แทนข้อความอังกฤษของ backend */
export const getConnectErrorMessage = (error: unknown): string => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const key = status ? MESSAGE_KEY_BY_STATUS[status] : undefined;

  return key
    ? i18n.t(`settings:connection.errors.${key}`)
    : getApiErrorMessage(error);
};

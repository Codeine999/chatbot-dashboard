import axios from "axios";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";

/** รหัสเหตุผลที่ backend ส่งมาใน body ของ 400 (ดู FACEBOOK_CONNECT_ERRORS ฝั่ง backend) */
const MESSAGE_KEY_BY_CODE: Record<string, string> = {
  FB_INVALID_TOKEN: "invalidToken",
  FB_NOT_PAGE_TOKEN: "notPageToken",
  FB_APP_SECRET_MISMATCH: "appSecretMismatch",
};

const MESSAGE_KEY_BY_STATUS: Record<number, string> = {
  400: "invalidToken",
  403: "noAccess",
  409: "conflict",
  502: "facebookUnreachable",
  503: "notReady",
};

/** แปลง error ของ PUT เป็นข้อความที่ทำตามได้ แทนข้อความอังกฤษของ backend */
export const getFacebookConnectErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return getApiErrorMessage(error);

  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  const status = error.response?.status;
  const key =
    (typeof code === "string" ? MESSAGE_KEY_BY_CODE[code] : undefined) ??
    (status ? MESSAGE_KEY_BY_STATUS[status] : undefined);

  return key
    ? i18n.t(`settings:connection.facebook.errors.${key}`)
    : getApiErrorMessage(error);
};

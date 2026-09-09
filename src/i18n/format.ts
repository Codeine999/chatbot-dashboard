import { INTL_LOCALES } from "./config";
import { getCurrentLanguage } from "./index";

/**
 * locale ที่ส่งให้ Intl ตามภาษาที่เลือกอยู่
 *
 * ฟังก์ชันในไฟล์นี้อ่านภาษาจาก i18n instance ตรง ๆ ไม่ผ่าน hook
 * เพื่อให้เรียกจากที่ไหนก็ได้ (service, util) โดยไม่ต้องส่ง locale ไปทุกจุด
 * component ที่ใช้ useTranslation() อยู่แล้วจะ re-render เองตอนเปลี่ยนภาษา
 * ทำให้ค่าที่ format ไว้ถูกคำนวณใหม่โดยอัตโนมัติ
 */
export const getIntlLocale = () => INTL_LOCALES[getCurrentLanguage()];

export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
) => value.toLocaleString(getIntlLocale(), options);

/** จำนวนเงินบาท ทศนิยม 2 ตำแหน่ง เช่น ฿1,250.00 */
export const formatBaht = (value: number) =>
  `฿${formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** จำนวนเงินบาทแบบไม่มีทศนิยม ใช้บนกราฟและการ์ดสรุป */
export const formatBahtRounded = (value: number) =>
  `฿${formatNumber(Math.round(value))}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(getIntlLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(getIntlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

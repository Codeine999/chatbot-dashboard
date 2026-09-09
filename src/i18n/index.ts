import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type Language,
} from "./config";

import enAdminTool from "./locales/en/adminTool.json";
import enAuth from "./locales/en/auth.json";
import enBill from "./locales/en/bill.json";
import enChat from "./locales/en/chat.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enKnowledge from "./locales/en/knowledge.json";
import enNav from "./locales/en/nav.json";
import enOrder from "./locales/en/order.json";
import enProduct from "./locales/en/product.json";
import enRichMenu from "./locales/en/richMenu.json";
import enSettings from "./locales/en/settings.json";
import enUsage from "./locales/en/usage.json";
import enUsers from "./locales/en/users.json";

import thAdminTool from "./locales/th/adminTool.json";
import thAuth from "./locales/th/auth.json";
import thBill from "./locales/th/bill.json";
import thChat from "./locales/th/chat.json";
import thCommon from "./locales/th/common.json";
import thHome from "./locales/th/home.json";
import thKnowledge from "./locales/th/knowledge.json";
import thNav from "./locales/th/nav.json";
import thOrder from "./locales/th/order.json";
import thProduct from "./locales/th/product.json";
import thRichMenu from "./locales/th/richMenu.json";
import thSettings from "./locales/th/settings.json";
import thUsage from "./locales/th/usage.json";
import thUsers from "./locales/th/users.json";

/** namespace เริ่มต้นเวลาเรียก useTranslation() โดยไม่ระบุชื่อ */
export const DEFAULT_NAMESPACE = "common";

export const resources = {
  en: {
    adminTool: enAdminTool,
    auth: enAuth,
    bill: enBill,
    chat: enChat,
    common: enCommon,
    home: enHome,
    knowledge: enKnowledge,
    nav: enNav,
    order: enOrder,
    product: enProduct,
    richMenu: enRichMenu,
    settings: enSettings,
    usage: enUsage,
    users: enUsers,
  },
  th: {
    adminTool: thAdminTool,
    auth: thAuth,
    bill: thBill,
    chat: thChat,
    common: thCommon,
    home: thHome,
    knowledge: thKnowledge,
    nav: thNav,
    order: thOrder,
    product: thProduct,
    richMenu: thRichMenu,
    settings: thSettings,
    usage: thUsage,
    users: thUsers,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: DEFAULT_NAMESPACE,
    ns: ["adminTool", "auth", "bill", "chat", "common", "home", "knowledge", "nav", "order", "product", "richMenu", "settings", "usage", "users"],

    // "en-US" ที่ browser ส่งมาต้องถูกยุบเหลือ "en" ไม่งั้นหา resource ไม่เจอ
    load: "languageOnly",
    nonExplicitSupportedLngs: true,

    detection: {
      // localStorage ก่อนเสมอ เพราะเป็นภาษาที่ผู้ใช้เลือกเอง
      // ถ้ายังไม่เคยเลือก ค่อยเดาจากภาษาของ browser
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },

    // React escape ให้อยู่แล้ว ปล่อยให้ i18next escape ซ้ำจะได้ &amp; เพี้ยน ๆ
    interpolation: { escapeValue: false },

    returnNull: false,
  });

/** sync <html lang> ให้ตรงกับภาษาปัจจุบัน มีผลกับ screen reader และการตัดคำของ browser */
const syncHtmlLang = (language: string) => {
  document.documentElement.lang = language;
};

syncHtmlLang(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", syncHtmlLang);

/** ภาษาปัจจุบัน — ใช้นอก React ได้ (formatter, axios interceptor) */
export const getCurrentLanguage = (): Language =>
  (i18n.resolvedLanguage as Language) ?? DEFAULT_LANGUAGE;

export default i18n;

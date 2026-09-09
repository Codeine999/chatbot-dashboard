import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  type Language,
} from "./config";

/**
 * อ่าน/เปลี่ยนภาษาปัจจุบัน
 *
 * ตัว i18next-browser-languagedetector เขียนลง localStorage ให้เองตอน changeLanguage
 * จึงไม่ต้อง setItem ซ้ำที่นี่ (ต่างจาก themeProvider ที่จัดการ localStorage เอง)
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  const language: Language = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (next: Language) => {
      if (next !== language) void i18n.changeLanguage(next);
    },
    [i18n, language]
  );

  return {
    language,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    labels: LANGUAGE_LABELS,
  };
};

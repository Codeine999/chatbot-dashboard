import i18n from "@/i18n";

/**
 * "3 นาทีที่แล้ว" / "3 mins ago"
 *
 * เรียก i18n.t ตรง ๆ แทน useTranslation เพราะเป็น util ที่ถูกเรียกจากนอก component ได้
 * component ที่ใช้ useTranslation อยู่แล้วจะ re-render ตอนเปลี่ยนภาษา ข้อความจึงอัปเดตตาม
 */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round(diffMs / 1000));

  if (diffSec < 60) return i18n.t("time.justNow");

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return i18n.t("time.minutesAgo", { count: diffMin });

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return i18n.t("time.hoursAgo", { count: diffHour });

  const diffDay = Math.round(diffHour / 24);
  return i18n.t("time.daysAgo", { count: diffDay });
}

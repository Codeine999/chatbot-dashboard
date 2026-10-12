/** สีของ badge หมวดหมู่ ถ้าเจอหมวดใหม่จะวนใช้สีจากลิสต์แทนที่จะไม่มีสี */
const CATEGORY_TONES = [
  "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
];

export const categoryTone = (category: string) => {
  const sum = [...category].reduce((total, char) => total + char.charCodeAt(0), 0);
  return CATEGORY_TONES[sum % CATEGORY_TONES.length];
};

export const truncate = (text: string, max = 34) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

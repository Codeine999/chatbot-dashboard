// ย้ายไปไว้ที่ lib เพื่อให้หน้าสินค้าใช้ร่วมกัน
export { categoryTone } from "@/lib/categoryTone";

export const truncate = (text: string, max = 34) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

const CATEGORY_DOTS = ["#2563eb", "#16a34a", "#8b5cf6", "#ea580c", "#db2777"];

/** จุดสีหน้าชื่อหมวดหมู่ ชื่อเดิมได้สีเดิมเสมอ */
export const categoryDot = (category: string) => {
  const sum = [...category].reduce((total, char) => total + char.charCodeAt(0), 0);
  return CATEGORY_DOTS[sum % CATEGORY_DOTS.length];
};

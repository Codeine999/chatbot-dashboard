// ย้ายไปไว้ที่ lib เพื่อให้หน้าสินค้าใช้ร่วมกัน
export { categoryTone } from "@/lib/categoryTone";

export const truncate = (text: string, max = 34) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

import type { Product } from "../type/product.type";

export const MOCK_COMPANY_ID = "6f1d2c3b-0000-4000-8000-000000000001";

export const productMock: Product[] = [];

/** หมวดและแบรนด์ตั้งต้น ให้ร้านใหม่ที่ยังไม่มีสินค้ามีตัวเลือกให้กดเลย */
export const defaultCategoriesMock = [
  "ซีพียู",
  "การ์ดจอ",
  "แรม",
  "SSD",
  "เมนบอร์ด",
  "แหล่งจ่ายไฟ",
  "เคส",
  "จอมอนิเตอร์",
  "ชุดระบายความร้อน",
];

export const defaultBrandsMock = [
  "AMD",
  "ASUS",
  "Corsair",
  "Gigabyte",
  "Intel",
  "Kingston",
  "LG",
  "MSI",
  "NZXT",
  "Samsung",
  "WD",
];

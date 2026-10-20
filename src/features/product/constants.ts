import type { ProductStatus, StockFilter } from "./type/product.type";

export const PRODUCT_STATUSES: ProductStatus[] = ["ACTIVE", "DRAFT", "ARCHIVED"];

/** สถานะที่เลือกได้ในฟอร์ม ส่วน ARCHIVED เกิดจากการเก็บสินค้าเข้าคลังเท่านั้น */
export const FORM_STATUSES = ["DRAFT", "ACTIVE"] as const satisfies readonly ProductStatus[];

export const STOCK_FILTERS: StockFilter[] = ["all", "in", "low", "out"];

export const PRODUCT_TABS = ["products", "categories", "import", "settings"] as const;
export type ProductTab = (typeof PRODUCT_TABS)[number];

export const PRODUCT_PAGE_SIZE = 10;

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

/** ความยาวตาม @db.VarChar ใน schema */
export const NAME_MAX = 255;
export const SKU_MAX = 100;
export const CATEGORY_MAX = 100;
export const BARCODE_MAX = 64;
export const BRAND_MAX = 100;
export const DESCRIPTION_MAX = 500;
export const TAG_MAX_COUNT = 20;

export const IMAGE_MAX_COUNT = 8;
export const IMAGE_MAX_SIZE_MB = 5;
export const IMAGE_ACCEPT = ["image/png", "image/jpeg"];

/** แผงรายละเอียดแสดงแท็กและรูปย่อได้เท่านี้ ที่เหลือรวมเป็น +N */
export const DETAIL_VISIBLE_TAGS = 3;
export const DETAIL_VISIBLE_THUMBS = 4;

/** เหตุผลที่บันทึกลง InventoryMovement.reason ตอนปรับสต็อกจากแผงรายละเอียด */
export const QUICK_STOCK_REASON = "dashboard:quick_adjust";

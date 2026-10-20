// ---------- ตรงกับ Prisma schema (สิ่งที่ API ส่งมา) ----------

/** enum ProductStatus */
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

/** Prisma Decimal ถูก serialize เป็น string เพื่อไม่ให้ทศนิยมเพี้ยน แปลงเป็น number ตอนแสดงผลเท่านั้น */
export type DecimalString = string;

/** model InventoryBalance */
export type InventoryBalance = {
  id: string;
  companyId: string;
  variantId: string;
  onHand: number;
  reserved: number;
  /** ใช้กันการปรับสต็อกทับกัน ส่งค่าเดิมกลับไปตอนปรับ */
  version: number;
  updatedAt: string;
};

/** ค่าที่ยังไม่มีคอลัมน์ของตัวเอง จึงเก็บใน ProductVariant.meta (Json) */
export type ProductVariantMeta = {
  barcode?: string;
  costPrice?: DecimalString;
  lowStockThreshold?: number;
};

/**
 * ข้อมูลระดับสินค้าที่หน้าจอต้องใช้ แต่ model Product ยังไม่มีที่เก็บ
 * ต้องให้ backend เพิ่ม `meta Json @default("{}")` ใน Product ก่อนต่อ API จริง
 */
export type ProductMeta = {
  brand?: string;
  tags?: string[];
  images?: string[];
  warrantyMonths?: number;
  showOnStorefront?: boolean;
  featured?: boolean;
};

/** model ProductVariant (ไม่รวม relation ตามประเภทธุรกิจ fashion/restaurant/hotel ที่หน้านี้ไม่ได้ใช้) */
export type ProductVariant = {
  id: string;
  companyId: string;
  productId: string;
  sku: string;
  price: DecimalString | null;
  compareAtPrice: DecimalString | null;
  inventory: InventoryBalance | null;
  meta: ProductVariantMeta;
  trackStock: boolean;
  currency: string;
  version: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** model Product พร้อม variants */
export type Product = {
  id: string;
  companyId: string;
  name: string;
  aliases: string[];
  description: string;
  category: string | null;
  language: string;
  status: ProductStatus;
  presetVersion: number;
  /** ใช้กันการแก้ไขทับกัน ส่งค่าเดิมกลับไปตอนบันทึก */
  revision: number;
  searchRevision: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  meta: ProductMeta;
};

export type ProductStats = {
  total: number;
  active: number;
  lowStock: number;
};

export type ProductOptions = {
  categories: string[];
  brands: string[];
};

// ---------- view model ที่หน้าจอใช้ ----------

export type StockLevel = "in" | "low" | "out" | "untracked";

/**
 * สินค้าหนึ่งรายการในรูปที่หน้าจอใช้ แปลงจาก Product + variant หลักแล้ว
 * หน้านี้ยังรองรับสินค้าแบบ variant เดียว (SKU เดียว) ตามดีไซน์
 */
export type ProductItem = {
  id: string;
  variantId: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  status: ProductStatus;
  sku: string;
  barcode: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currency: string;
  /** สต็อกที่ขายได้จริง = onHand - reserved */
  stock: number;
  trackStock: boolean;
  lowStockThreshold: number;
  stockLevel: StockLevel;
  inventoryVersion: number;
  warrantyMonths: number | null;
  tags: string[];
  images: string[];
  showOnStorefront: boolean;
  featured: boolean;
  revision: number;
  updatedAt: string;
};

export type StockFilter = Exclude<StockLevel, "untracked"> | "all";

export type ProductFilters = {
  search: string;
  /** "all" = ทุกหมวด */
  category: string;
  status: ProductStatus | "all";
  stock: StockFilter;
};

// ---------- payload ที่ส่งไป API ----------

/** รูปเดิมส่งกลับเป็น URL รูปใหม่ส่งเป็นไฟล์ ลำดับในลิสต์คือลำดับรูป (ตัวแรก = รูปหลัก) */
export type ProductImageInput = { kind: "existing"; url: string } | { kind: "new"; file: File };

export type ProductUpsertPayload = {
  /** idempotency key ตรงกับ ProductCatalogCommand.requestId กดซ้ำหรือ retry แล้วไม่สร้างซ้ำ */
  requestId: string;
  name: string;
  description: string;
  category: string;
  status: ProductStatus;
  meta: Omit<ProductMeta, "images">;
  variant: {
    /** ว่าง = ให้ backend สร้าง SKU ให้ */
    sku: string | null;
    price: DecimalString;
    compareAtPrice: DecimalString | null;
    trackStock: boolean;
    /**
     * สต็อกที่ขายได้ตามที่แอดมินกรอก (onHand - reserved)
     * backend เทียบกับค่าปัจจุบันแล้วบันทึกส่วนต่างเป็น InventoryMovement เอง
     */
    stock: number;
    meta: ProductVariantMeta;
  };
  images: ProductImageInput[];
};

export type UpdateProductPayload = ProductUpsertPayload & {
  id: string;
  revision: number;
};

/** สร้าง InventoryMovement หนึ่งรายการ */
export type AdjustStockPayload = {
  requestId: string;
  variantId: string;
  deltaOnHand: number;
  expectedVersion: number;
  reason: string;
};

export type ProductErrorCode = "NOT_FOUND" | "SKU_TAKEN" | "VERSION_CONFLICT";

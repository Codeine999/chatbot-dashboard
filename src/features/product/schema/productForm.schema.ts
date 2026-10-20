import { z } from "zod";
import {
  BARCODE_MAX,
  BRAND_MAX,
  CATEGORY_MAX,
  DEFAULT_LOW_STOCK_THRESHOLD,
  DESCRIPTION_MAX,
  NAME_MAX,
  SKU_MAX,
  TAG_MAX_COUNT,
} from "../constants";

// ข้อความ error เก็บเป็น translation key แล้วให้ <FormMessage> แปลตอน render
// ช่องตัวเลขเก็บเป็น string ตามที่ผู้ใช้พิมพ์ แปลงเป็นตัวเลขตอนสร้าง payload

/** Decimal(12, 2): จำนวนเต็มไม่เกิน 10 หลัก ทศนิยมไม่เกิน 2 ตำแหน่ง */
const DECIMAL_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;
const INTEGER_PATTERN = /^\d{1,9}$/;
const SKU_PATTERN = /^[A-Za-z0-9._-]*$/;

const optionalPrice = z
  .string()
  .trim()
  .refine((value) => value === "" || DECIMAL_PATTERN.test(value), "product:validation.priceInvalid");

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "product:validation.nameRequired").max(NAME_MAX),
    sku: z.string().trim().max(SKU_MAX).regex(SKU_PATTERN, "product:validation.skuInvalid"),
    barcode: z.string().trim().max(BARCODE_MAX),
    description: z.string().max(DESCRIPTION_MAX),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    category: z.string().trim().min(1, "product:validation.categoryRequired").max(CATEGORY_MAX),
    brand: z.string().trim().max(BRAND_MAX),
    tags: z.array(z.string()).max(TAG_MAX_COUNT),
    price: z
      .string()
      .trim()
      .min(1, "product:validation.priceRequired")
      .regex(DECIMAL_PATTERN, "product:validation.priceInvalid"),
    compareAtPrice: optionalPrice,
    costPrice: optionalPrice,
    stock: z
      .string()
      .trim()
      .min(1, "product:validation.stockRequired")
      .regex(INTEGER_PATTERN, "product:validation.stockInvalid"),
    trackStock: z.boolean(),
    lowStockThreshold: z
      .string()
      .trim()
      .regex(INTEGER_PATTERN, "product:validation.thresholdInvalid"),
    showOnStorefront: z.boolean(),
    featured: z.boolean(),
  })
  .refine(
    (values) =>
      values.compareAtPrice === "" || Number(values.compareAtPrice) > Number(values.price),
    { path: ["compareAtPrice"], message: "product:validation.compareAtTooLow" }
  );

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productFormDefaults: ProductFormValues = {
  name: "",
  sku: "",
  barcode: "",
  description: "",
  status: "DRAFT",
  category: "",
  brand: "",
  tags: [],
  price: "",
  compareAtPrice: "",
  costPrice: "",
  stock: "",
  trackStock: true,
  lowStockThreshold: String(DEFAULT_LOW_STOCK_THRESHOLD),
  showOnStorefront: true,
  featured: false,
};

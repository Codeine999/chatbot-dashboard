import { DEFAULT_LOW_STOCK_THRESHOLD } from "../constants";
import type { ProductFormValues } from "../schema/productForm.schema";
import type {
  Product,
  ProductImageInput,
  ProductItem,
  ProductUpsertPayload,
} from "../type/product.type";
import { getStockLevel, toNumber } from "./product";

/** API → หน้าจอ ใช้ variant ที่ active ตัวแรกเป็นตัวหลัก */
export const toProductItem = (product: Product): ProductItem => {
  const variant = product.variants.find((item) => item.active) ?? product.variants[0];
  const inventory = variant?.inventory;
  const stock = Math.max(0, (inventory?.onHand ?? 0) - (inventory?.reserved ?? 0));
  const trackStock = variant?.trackStock ?? true;
  const lowStockThreshold = variant?.meta.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

  return {
    id: product.id,
    variantId: variant?.id ?? "",
    name: product.name,
    description: product.description,
    category: product.category ?? "",
    brand: product.meta.brand ?? "",
    status: product.status,
    sku: variant?.sku ?? "",
    barcode: variant?.meta.barcode ?? "",
    price: toNumber(variant?.price) ?? 0,
    compareAtPrice: toNumber(variant?.compareAtPrice),
    costPrice: toNumber(variant?.meta.costPrice),
    currency: variant?.currency ?? "THB",
    stock,
    trackStock,
    lowStockThreshold,
    stockLevel: getStockLevel(stock, lowStockThreshold, trackStock),
    inventoryVersion: inventory?.version ?? 0,
    warrantyMonths: product.meta.warrantyMonths ?? null,
    tags: product.meta.tags ?? [],
    images: product.meta.images ?? [],
    showOnStorefront: product.meta.showOnStorefront ?? true,
    featured: product.meta.featured ?? false,
    revision: product.revision,
    updatedAt: product.updatedAt,
  };
};

const toPriceInput = (value: number | null) => (value == null ? "" : value.toFixed(2));

/** หน้าจอ → ค่าเริ่มต้นของฟอร์มแก้ไข */
export const toFormValues = (item: ProductItem): ProductFormValues => ({
  name: item.name,
  sku: item.sku,
  barcode: item.barcode,
  description: item.description,
  status: item.status,
  category: item.category,
  brand: item.brand,
  tags: [...item.tags],
  price: toPriceInput(item.price),
  compareAtPrice: toPriceInput(item.compareAtPrice),
  costPrice: toPriceInput(item.costPrice),
  stock: String(item.stock),
  trackStock: item.trackStock,
  lowStockThreshold: String(item.lowStockThreshold),
  showOnStorefront: item.showOnStorefront,
  featured: item.featured,
});

const emptyToNull = (value: string) => (value === "" ? null : value);

/** ฟอร์ม → payload ที่ส่งไป API */
export const toUpsertPayload = (
  values: ProductFormValues,
  images: ProductImageInput[]
): ProductUpsertPayload => ({
  requestId: crypto.randomUUID(),
  name: values.name,
  description: values.description.trim(),
  category: values.category,
  status: values.status,
  meta: {
    brand: values.brand || undefined,
    tags: values.tags,
    showOnStorefront: values.showOnStorefront,
    featured: values.featured,
  },
  variant: {
    sku: emptyToNull(values.sku),
    price: values.price,
    compareAtPrice: emptyToNull(values.compareAtPrice),
    trackStock: values.trackStock,
    stock: Number(values.stock),
    meta: {
      barcode: values.barcode || undefined,
      costPrice: values.costPrice || undefined,
      lowStockThreshold: Number(values.lowStockThreshold),
    },
  },
  images,
});

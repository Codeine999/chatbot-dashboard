import type {
  DecimalString,
  ProductFilters,
  ProductItem,
  ProductStatus,
  StockLevel,
} from "../type/product.type";
import type { DotBadgeTone } from "@/components/common/DotBadge";

export const STATUS_TONE: Record<ProductStatus, DotBadgeTone> = {
  ACTIVE: "success",
  DRAFT: "neutral",
  ARCHIVED: "warning",
};

export const STOCK_LEVEL_TEXT: Record<StockLevel, string> = {
  in: "text-normal",
  low: "text-orange-500 dark:text-orange-400",
  out: "text-red-500 dark:text-red-400",
  untracked: "text-mini",
};

export const toNumber = (value: DecimalString | null | undefined) =>
  value == null || value === "" ? null : Number(value);

/** แจ้งเตือนเมื่อ "เหลือน้อยกว่า" threshold จึงใช้ < ไม่ใช่ <= */
export const getStockLevel = (
  stock: number,
  threshold: number,
  trackStock: boolean
): StockLevel => {
  if (!trackStock) return "untracked";
  if (stock <= 0) return "out";
  if (stock < threshold) return "low";
  return "in";
};

/** % ส่วนลดจากราคาปกติ ปัดเป็นจำนวนเต็ม ไม่มีส่วนลดคืน null */
export const getDiscountPercent = (price: number, compareAtPrice: number | null) =>
  compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : null;

export const filterProducts = (items: ProductItem[], filters: ProductFilters) => {
  const keyword = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.stock !== "all" && item.stockLevel !== filters.stock) return false;
    if (!keyword) return true;

    return (
      item.name.toLowerCase().includes(keyword) || item.sku.toLowerCase().includes(keyword)
    );
  });
};

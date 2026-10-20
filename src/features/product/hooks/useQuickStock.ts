import { useState } from "react";
import { QUICK_STOCK_REASON } from "../constants";
import { useAdjustStock } from "./useProducts";
import type { ProductItem } from "../type/product.type";

/**
 * ตัวเลขสต็อกในแผงรายละเอียดที่ปรับก่อนกดบันทึก
 * component ที่ใช้ควรใส่ key เป็น id + stock ไว้ ค่าจะรีเซ็ตเองเมื่อสลับสินค้าหรือสต็อกเปลี่ยน
 */
export function useQuickStock(product: ProductItem) {
  const [value, setValue] = useState(product.stock);
  const adjust = useAdjustStock();

  const save = () =>
    adjust.mutate({
      requestId: crypto.randomUUID(),
      variantId: product.variantId,
      // ส่งเป็นส่วนต่าง เพราะ backend บันทึกเป็น InventoryMovement.deltaOnHand
      deltaOnHand: value - product.stock,
      expectedVersion: product.inventoryVersion,
      reason: QUICK_STOCK_REASON,
    });

  return {
    value,
    setValue,
    isDirty: value !== product.stock,
    isSaving: adjust.isPending,
    save,
  };
}

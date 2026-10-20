import { useTranslation } from "react-i18next";
import { NumberStepper } from "@/components/common/NumberStepper";
import { Button } from "@/components/ui/button";
import { useQuickStock } from "../../hooks/useQuickStock";
import type { ProductItem } from "../../type/product.type";

/** ใส่ key={`${product.id}:${product.stock}`} เพื่อให้ตัวเลขรีเซ็ตเมื่อสต็อกเปลี่ยน */
export const QuickStockAdjust = ({ product }: { product: ProductItem }) => {
  const { t } = useTranslation("product");
  const quickStock = useQuickStock(product);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs font-semibold text-normal">{t("detail.quickStock")}</p>

      <div className="flex items-center gap-2">
        <NumberStepper
          value={quickStock.value}
          onChange={quickStock.setValue}
          disabled={quickStock.isSaving}
          label={t("detail.quickStock")}
        />
        <Button
          type="button"
          disabled={!quickStock.isDirty || quickStock.isSaving}
          onClick={quickStock.save}
        >
          {quickStock.isSaving ? t("detail.saving") : t("detail.save")}
        </Button>
      </div>
    </div>
  );
};

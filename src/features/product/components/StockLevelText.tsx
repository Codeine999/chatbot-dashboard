import { useTranslation } from "react-i18next";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { STOCK_LEVEL_TEXT } from "../utils/product";
import type { StockLevel } from "../type/product.type";

type Props = {
  stock: number;
  level: StockLevel;
  /** ต่อท้ายหน่วย "ชิ้น" */
  withUnit?: boolean;
  className?: string;
};

/** จำนวนสต็อกพร้อมป้ายเตือน ใกล้หมด/หมด สีเปลี่ยนตามระดับ */
export const StockLevelText = ({ stock, level, withUnit = false, className }: Props) => {
  const { t } = useTranslation("product");

  if (level === "untracked") {
    return <span className={cn("text-xs text-mini", className)}>{t("stockLevel.untracked")}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 text-sm tabular-nums",
        STOCK_LEVEL_TEXT[level],
        className
      )}
    >
      {withUnit
        ? t("unit.piece", { count: stock, value: formatNumber(stock) })
        : formatNumber(stock)}
      {(level === "low" || level === "out") && (
        <span className="text-xs">{t(`stockLevel.${level}`)}</span>
      )}
    </span>
  );
};

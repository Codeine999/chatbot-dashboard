import { useState, type ReactNode } from "react";
import { Copy, Package, Pencil, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatBahtRounded } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { DETAIL_VISIBLE_TAGS } from "../../constants";
import { getDiscountPercent } from "../../utils/product";
import { ProductStatusBadge } from "../ProductStatusBadge";
import { StockLevelText } from "../StockLevelText";
import { ProductGallery } from "./ProductGallery";
import { QuickStockAdjust } from "./QuickStockAdjust";
import type { ProductItem } from "../../type/product.type";

type Props = {
  product: ProductItem;
  isDuplicating: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  className?: string;
};

const InfoItem = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-xs text-mini">{label}</dt>
    <dd className="mt-0.5 truncate text-sm font-medium text-normal">{children}</dd>
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-semibold text-normal">{children}</p>
);

const chipClassName = "rounded-md bg-hover px-2 py-1 text-xs text-normal";

/**
 * แผงรายละเอียดสินค้า โครงเดียวกับแผงแก้ไขในหน้าคลังความรู้ AI
 * ควร render ด้วย key={product.id} เพื่อให้รูปที่เลือกและแท็กที่กางไว้รีเซ็ตเมื่อสลับสินค้า
 */
export const ProductDetailPanel = ({
  product,
  isDuplicating,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  className,
}: Props) => {
  const { t } = useTranslation("product");
  const [showAllTags, setShowAllTags] = useState(false);

  const discount = getDiscountPercent(product.price, product.compareAtPrice);
  const visibleTags = showAllTags ? product.tags : product.tags.slice(0, DETAIL_VISIBLE_TAGS);
  const hiddenTagCount = product.tags.length - visibleTags.length;

  const warranty =
    product.warrantyMonths == null
      ? "—"
      : product.warrantyMonths % 12 === 0
        ? t("detail.warrantyYears", { count: product.warrantyMonths / 12 })
        : t("detail.warrantyMonths", { count: product.warrantyMonths });

  const copySku = async () => {
    try {
      await navigator.clipboard.writeText(product.sku);
      toast.success(t("toast.skuCopied"));
    } catch {
      toast.error(t("toast.copyFailed"));
    }
  };

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-icons" />
          <p className="text-sm font-semibold text-normal">{t("detail.title")}</p>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail.close")}>
          <X className="size-4 text-mini" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 touch-pan-y space-y-4 overflow-y-auto overscroll-contain p-4">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base leading-snug font-semibold text-normal">{product.name}</h3>
            <ProductStatusBadge status={product.status} />
          </div>

          <div className="mt-1 flex items-center gap-1 text-xs text-mini">
            <span className="truncate">{product.sku}</span>
            <button
              type="button"
              onClick={copySku}
              aria-label={t("actions.copySku")}
              className="cursor-pointer rounded-md p-1 transition hover:bg-hover hover:text-icons"
            >
              <Copy className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-2xl font-semibold tabular-nums text-normal">
              {formatBahtRounded(product.price)}
            </span>
            {discount != null && product.compareAtPrice != null && (
              <>
                <span className="text-xs tabular-nums text-mini line-through">
                  {formatBahtRounded(product.compareAtPrice)}
                </span>
                <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  -{discount}%
                </span>
              </>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-xl border p-3">
          <InfoItem label={t("detail.category")}>{product.category || "—"}</InfoItem>
          <InfoItem label={t("detail.brand")}>{product.brand || "—"}</InfoItem>
          <InfoItem label={t("detail.stockLeft")}>
            <StockLevelText
              stock={product.stock}
              level={product.stockLevel}
              withUnit
              className="font-medium"
            />
          </InfoItem>
          <InfoItem label={t("detail.warranty")}>{warranty}</InfoItem>
        </dl>

        {product.trackStock && (
          <QuickStockAdjust key={`${product.id}:${product.stock}`} product={product} />
        )}

        <div>
          <SectionTitle>{t("detail.description")}</SectionTitle>
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-normal">
            {product.description || t("detail.noDescription")}
          </p>
        </div>

        {product.tags.length > 0 && (
          <div>
            <SectionTitle>{t("detail.tags")}</SectionTitle>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <span key={tag} className={chipClassName}>
                  {tag}
                </span>
              ))}
              {hiddenTagCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(true)}
                  aria-label={t("detail.moreTags", { count: hiddenTagCount })}
                  className={cn(chipClassName, "cursor-pointer text-mini transition hover:text-normal")}
                >
                  +{hiddenTagCount}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t p-4">
        <Button className="flex-1 gap-1.5" onClick={onEdit}>
          <Pencil className="size-4" />
          {t("actions.edit")}
        </Button>
        <Button variant="ghost" className="border" disabled={isDuplicating} onClick={onDuplicate}>
          {t("actions.duplicate")}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="border text-red-500 hover:text-red-600"
          onClick={onDelete}
          aria-label={t("actions.delete")}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </aside>
  );
};

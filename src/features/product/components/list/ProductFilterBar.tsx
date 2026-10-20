import { useTranslation } from "react-i18next";
import { SearchInput } from "@/components/common/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_STATUSES, STOCK_FILTERS } from "../../constants";
import type { ProductFilters, ProductStatus, StockFilter } from "../../type/product.type";

type Props = {
  filters: ProductFilters;
  categories: string[];
  onChange: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
};

export const ProductFilterBar = ({ filters, categories, onChange }: Props) => {
  const { t } = useTranslation("product");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
        placeholder={t("filter.searchPlaceholder")}
        aria-label={t("filter.searchPlaceholder")}
        wrapperClassName="min-w-45 flex-1"
      />

      <Select value={filters.category} onValueChange={(value) => onChange("category", value)}>
        <SelectTrigger className="w-40" aria-label={t("filter.category")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allCategories")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onChange("status", value as ProductStatus | "all")}
      >
        <SelectTrigger className="w-36" aria-label={t("filter.status")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
          {PRODUCT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`status.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.stock}
        onValueChange={(value) => onChange("stock", value as StockFilter)}
      >
        <SelectTrigger className="w-40" aria-label={t("filter.stock")}>
          {/* ปุ่มแสดงแบบมีคำนำหน้า "สต็อก:" ส่วนในลิสต์แสดงแค่ชื่อตัวเลือก */}
          <SelectValue>
            {t("filter.stockValue", { value: t(`filter.stockOption.${filters.stock}`) })}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STOCK_FILTERS.map((stock) => (
            <SelectItem key={stock} value={stock}>
              {t(`filter.stockOption.${stock}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

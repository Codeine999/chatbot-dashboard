import { useTranslation } from "react-i18next";
import { ImageThumb } from "@/components/common/ImageThumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBahtRounded } from "@/i18n/format";
import { categoryTone } from "@/lib/categoryTone";
import { cn } from "@/lib/utils";
import { ProductStatusBadge } from "../ProductStatusBadge";
import { StockLevelText } from "../StockLevelText";
import type { ProductItem } from "../../type/product.type";

const COLUMN_COUNT = 6;
const SKELETON_ROWS = 6;

type Props = {
  items: ProductItem[];
  activeId?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpen: (item: ProductItem) => void;
};

const StateRow = ({ children }: { children: React.ReactNode }) => (
  <TableRow className="hover:bg-transparent">
    <TableCell colSpan={COLUMN_COUNT} className="py-10 text-center">
      {children}
    </TableCell>
  </TableRow>
);

export const ProductTable = ({
  items,
  activeId,
  isLoading,
  isError,
  onRetry,
  isSelected,
  isAllSelected,
  onToggleSelect,
  onToggleSelectAll,
  onOpen,
}: Props) => {
  const { t } = useTranslation("product");

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onToggleSelectAll}
                disabled={items.length === 0}
                aria-label={t("table.selectAll")}
              />
            </TableHead>
            <TableHead>{t("table.product")}</TableHead>
            <TableHead>{t("table.category")}</TableHead>
            <TableHead className="text-right">{t("table.price")}</TableHead>
            <TableHead className="pl-6">{t("table.stock")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell colSpan={COLUMN_COUNT}>
                  <div className="flex items-center gap-3 py-1">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-1/3" />
                      <Skeleton className="h-3 w-1/5" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && isError && (
            <StateRow>
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-destructive">{t("table.error")}</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  {t("common:actions.retry")}
                </Button>
              </div>
            </StateRow>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <StateRow>
              <p className="text-sm text-mini">{t("table.noMatch")}</p>
            </StateRow>
          )}

          {!isLoading &&
            !isError &&
            items.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onOpen(item)}
                aria-selected={item.id === activeId}
                className={cn("cursor-pointer", item.id === activeId && "bg-hover")}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={isSelected(item.id)}
                    onCheckedChange={() => onToggleSelect(item.id)}
                    aria-label={t("table.selectRow", { name: item.name })}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <ImageThumb
                      src={item.images[0]}
                      alt={item.name}
                      className="size-10 rounded-lg"
                      iconClassName="size-4"
                    />
                    <div className="min-w-0">
                      <p className="max-w-48 truncate text-sm font-medium text-normal">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-mini">{item.sku}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {item.category && (
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        categoryTone(item.category)
                      )}
                    >
                      {item.category}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right text-sm tabular-nums text-normal">
                  {formatBahtRounded(item.price)}
                </TableCell>

                <TableCell className="pl-6">
                  <StockLevelText stock={item.stock} level={item.stockLevel} />
                </TableCell>

                <TableCell>
                  <ProductStatusBadge status={item.status} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZES = [10, 20, 50];

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** ส่งมาเมื่อให้ผู้ใช้เลือกจำนวนแถวต่อหน้าได้ */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

/** ท้ายตาราง: แสดงช่วงรายการ + แถวต่อหน้า + ก่อนหน้า/ถัดไป แบบเดียวกับหน้าคลังความรู้ AI */
export const TablePagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  className,
}: Props) => {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-xs text-mini">
        {t("pagination.showing", {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-mini">{t("pagination.rowsPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-18" aria-label={t("pagination.rowsPerPage")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <nav className="flex items-center gap-1" aria-label={t("pagination.label")}>
          <Button
            variant="ghost"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={t("pagination.previous")}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="px-2 text-xs tabular-nums text-normal">
            {page} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t("pagination.next")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      </div>
    </div>
  );
};

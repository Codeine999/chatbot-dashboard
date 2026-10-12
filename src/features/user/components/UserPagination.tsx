import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";

/** แสดงเลขหน้าไม่เกิน 5 ปุ่ม เลื่อนกรอบให้หน้าปัจจุบันอยู่กลางเมื่อหน้าเยอะ */
const pageWindow = (page: number, totalPages: number, size = 5) => {
  const start = Math.max(1, Math.min(page - Math.floor(size / 2), totalPages - size + 1));
  const length = Math.min(size, totalPages);

  return Array.from({ length }, (_, index) => start + index);
};

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export const UserPagination = ({ page, pageSize, total, onPageChange }: Props) => {
  const { t } = useTranslation("users");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-sm text-mini">
        {t("pagination.showing", {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("pagination.previous")}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pageWindow(page, totalPages).map((value) => (
          <Button
            key={value}
            variant={value === page ? "default" : "outline"}
            size="icon"
            className={cn("size-9 text-sm", value === page && "pointer-events-none")}
            aria-current={value === page ? "page" : undefined}
            onClick={() => onPageChange(value)}
          >
            {formatNumber(value)}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="size-9"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("pagination.next")}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

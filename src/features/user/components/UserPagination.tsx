import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "@/i18n/format";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

/** ข้อความสรุปทางซ้าย และเลขหน้าแบบ mono ทางขวา ตามดีไซน์ */
export const UserPagination = ({ page, pageSize, total, onPageChange }: Props) => {
  const { t } = useTranslation("users");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navClass =
    "flex size-8 cursor-pointer items-center justify-center rounded-lg text-normal transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 text-[13px] text-mini">
      <p>
        {t("pagination.showing", {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navClass}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("pagination.previous")}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-1 font-mono text-xs" aria-current="page">
          {formatNumber(page)} / {formatNumber(totalPages)}
        </span>
        <button
          type="button"
          className={navClass}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("pagination.next")}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
};

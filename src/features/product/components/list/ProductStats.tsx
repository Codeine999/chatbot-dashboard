import { CircleCheck, Package, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/common/StatCard";
import { formatNumber } from "@/i18n/format";
import type { ProductStats as Stats } from "../../type/product.type";

type Props = {
  stats?: Stats;
  isLoading: boolean;
  onViewLowStock: () => void;
};

export const ProductStats = ({ stats, isLoading, onViewLowStock }: Props) => {
  const { t } = useTranslation("product");
  const total = stats?.total ?? 0;
  const active = stats?.active ?? 0;
  const activePercent = total ? Math.round((active / total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <StatCard
        label={t("stats.total")}
        value={formatNumber(total)}
        hint={t("stats.totalHint")}
        icon={Package}
        tone="primary"
        isLoading={isLoading}
      />

      <StatCard
        label={t("stats.active")}
        value={formatNumber(active)}
        hint={t("stats.activeHint", { percent: activePercent })}
        icon={CircleCheck}
        tone="success"
        isLoading={isLoading}
      />

      <StatCard
        label={t("stats.lowStock")}
        value={formatNumber(stats?.lowStock ?? 0)}
        hint={
          <button
            type="button"
            onClick={onViewLowStock}
            className="cursor-pointer text-icons hover:underline"
          >
            {t("stats.viewLowStock")}
          </button>
        }
        icon={TriangleAlert}
        tone="warning"
        isLoading={isLoading}
      />
    </div>
  );
};

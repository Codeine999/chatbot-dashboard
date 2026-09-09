import { useTranslation } from "react-i18next";
import { formatNumber } from "@/i18n/format";
import { BookOpen, CircleCheck, Folder } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { KnowledgeStats } from "../type/knowledge.type";

type StatCardProps = {
  label: string;
  value: string;
  hint: React.ReactNode;
  icon: React.ElementType;
  tone: string;
};

const StatCard = ({ label, value, hint, icon: Icon, tone }: StatCardProps) => (
  <Card className="flex items-start justify-between gap-3 p-5">
    <div className="min-w-0">
      <p className="text-sm text-mini">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-normal">{value}</p>
      <div className="mt-2 text-xs text-mini">{hint}</div>
    </div>

    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-5 w-5" />
    </div>
  </Card>
);

type Props = {
  stats: KnowledgeStats;
  onManageCategories?: () => void;
};

const KnowledgeStatsCards = ({ stats, onManageCategories }: Props) => {
  const { t } = useTranslation("knowledge");
  const activePercent = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <StatCard
        label={t("stats.total")}
        value={formatNumber(stats.total)}
        hint={t("stats.totalHint")}
        icon={BookOpen}
        tone="bg-purple-50 text-icons dark:bg-purple-500/10"
      />

      <StatCard
        label={t("stats.active")}
        value={formatNumber(stats.active)}
        hint={t("stats.activeHint", { percent: activePercent })}
        icon={CircleCheck}
        tone="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
      />

      <StatCard
        label={t("stats.categories")}
        value={String(stats.categories)}
        hint={
          <button
            type="button"
            onClick={onManageCategories}
            className="text-icons hover:underline"
          >
            {t("stats.manageCategories")}
          </button>
        }
        icon={Folder}
        tone="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
      />
    </div>
  );
};

export default KnowledgeStatsCards;

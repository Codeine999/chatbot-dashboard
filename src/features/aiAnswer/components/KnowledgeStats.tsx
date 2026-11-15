import { useTranslation } from "react-i18next";
import { formatNumber } from "@/i18n/format";
import { CircleCheck, Folder, MessageSquare, type LucideIcon } from "lucide-react";
import type { KnowledgeStats } from "../type/knowledge.type";

type Props = {
  stats: KnowledgeStats;
  onManageCategories?: () => void;
};

const Label = ({ icon: Icon, color, children }: { icon: LucideIcon; color: string; children: React.ReactNode }) => (
  <span className="flex items-center gap-2 text-[13px] text-normal">
    <Icon className="size-4 shrink-0" style={{ color }} strokeWidth={1.7} />
    {children}
  </span>
);

const Value = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[30px] font-semibold leading-none tracking-[-0.025em] text-foreground tabular-nums">
    {children}
  </span>
);

/** สถิติแบบไม่มีกรอบ 3 ช่อง คั่นด้วยเส้นตั้ง */
const KnowledgeStatsCards = ({ stats, onManageCategories }: Props) => {
  const { t } = useTranslation("knowledge");
  const activePercent = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-y-6">
      <div className="flex flex-col gap-2 pr-6">
        <Label icon={MessageSquare} color="#8b5cf6">{t("stats.total")}</Label>
        <Value>{formatNumber(stats.total)}</Value>
        <span className="text-[13px] text-muted-foreground">{t("stats.totalHint")}</span>
      </div>

      <div className="flex flex-col gap-2 border-l px-6">
        <Label icon={CircleCheck} color="#16a34a">{t("stats.active")}</Label>
        <Value>{formatNumber(stats.active)}</Value>
        <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="h-1 w-16 overflow-hidden rounded-sm bg-muted">
            <span className="block h-1 bg-[#16a34a]" style={{ width: `${activePercent}%` }} />
          </span>
          {t("stats.activeHint", { percent: activePercent })}
        </span>
      </div>

      <div className="flex flex-col gap-2 border-l pl-6">
        <Label icon={Folder} color="#2563eb">{t("stats.categories")}</Label>
        <Value>{String(stats.categories)}</Value>
        <button
          type="button"
          onClick={onManageCategories}
          className="w-fit cursor-pointer text-[13px] font-medium text-foreground underline underline-offset-[3px]"
        >
          {t("stats.manageCategories")}
        </button>
      </div>
    </div>
  );
};

export default KnowledgeStatsCards;

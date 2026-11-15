import { useTranslation } from "react-i18next";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { UserTab } from "../type";

const TABS: UserTab[] = ["line", "registered"];

export const UserTabs = ({
  value,
  counts,
  className,
  onChange,
}: {
  value: UserTab;
  counts?: Record<UserTab, number>;
  className?: string;
  onChange: (tab: UserTab) => void;
}) => {
  const { t } = useTranslation("users");

  return (
    <div
      role="tablist"
      aria-label={t("tabsLabel")}
      className={cn("flex gap-6 overflow-x-auto border-b border-border", className)}
    >
      {TABS.map((tab) => {
        const isActive = tab === value;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={cn(
              "-mb-px flex h-11 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 text-sm font-medium transition-colors",
              isActive ? "border-foreground text-foreground" : "border-transparent text-mini hover:text-foreground"
            )}
          >
            {t(`tab.${tab}`)}
            {counts && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px font-mono text-[11px]",
                  isActive ? "bg-muted text-normal" : "bg-muted/60 text-mini"
                )}
              >
                {formatNumber(counts[tab])}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

import { useTranslation } from "react-i18next";
import { MessageCircle, UsersRound } from "lucide-react";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { UserTab } from "../type";

const TABS: { value: UserTab; icon: React.ElementType }[] = [
  { value: "line", icon: MessageCircle },
  { value: "registered", icon: UsersRound },
];

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
    <div className={cn("flex gap-6 overflow-x-auto border-b", className)}>
      {TABS.map(({ value: tab, icon: Icon }) => {
        const isActive = tab === value;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm transition",
              isActive
                ? "border-button-primary font-medium text-button-primary"
                : "border-transparent text-mini hover:text-normal"
            )}
          >
            <Icon className="size-4" />
            {t(`tab.${tab}`)}
            {counts && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs font-medium",
                  isActive ? "bg-button-primary/10 text-button-primary" : "bg-muted text-mini"
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

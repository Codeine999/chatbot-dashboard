import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/i18n/format";
import type { LineUser, UserTabCounts } from "../type";

const DAY_MS = 24 * 60 * 60 * 1000;

const Stat = ({
  label,
  dot,
  value,
  hint,
  isLoading,
  className,
}: {
  label: string;
  dot: string;
  value: string;
  hint: string;
  isLoading: boolean;
  className?: string;
}) => (
  <div className={`flex min-w-0 flex-col gap-2 ${className ?? ""}`}>
    <span className="flex items-center gap-2 text-[13px] text-normal">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
    {isLoading ? (
      <Skeleton className="h-7 w-16" />
    ) : (
      <span className="text-[30px] font-semibold leading-none tracking-[-0.025em] text-foreground tabular-nums">
        {value}
      </span>
    )}
    <span className="truncate text-[13px] text-mini">{hint}</span>
  </div>
);

/**
 * แถวสถิติ 4 ช่องคั่นด้วยเส้นตั้ง ตามดีไซน์
 * สองช่องแรกเป็นตัวเลขรวมจาก API. ข้อความทั้งหมดและผู้ใช้งานใน 7 วันคำนวณจากรายการที่โหลดอยู่ในหน้านี้
 */
export const UserStatsCards = ({
  counts,
  lineUsers,
  isLoading,
}: {
  counts?: UserTabCounts;
  lineUsers: LineUser[];
  isLoading: boolean;
}) => {
  const { t } = useTranslation("users");

  const registered = counts?.registered ?? 0;
  const line = counts?.line ?? 0;
  const contacts = registered + line;
  const convertedPercent = contacts ? Math.round((registered / contacts) * 100) : 0;

  const totalMessages = lineUsers.reduce((sum, user) => sum + user.messageCount, 0);
  const now = Date.now();
  const activeUsers = lineUsers.filter(
    (user) => user.lastActiveAt && now - Date.parse(user.lastActiveAt) <= 7 * DAY_MS
  );
  const activeHint =
    activeUsers.length === 0
      ? t("stats.noneActive")
      : activeUsers
          .slice(0, 2)
          .map((user) => user.displayName)
          .join(", ");

  return (
    <div className="mt-9 grid grid-cols-2 gap-y-6 md:grid-cols-4">
      <Stat
        label={t("stats.lineUsers")}
        dot="bg-[#06c755]"
        value={formatNumber(line)}
        hint={t("stats.lineUsersHint")}
        isLoading={isLoading}
        className="pr-6"
      />
      <Stat
        label={t("stats.signedUp")}
        dot="bg-[#8b5cf6]"
        value={formatNumber(registered)}
        hint={t("stats.registeredHint", { percent: convertedPercent })}
        isLoading={isLoading}
        className="border-l border-border px-6 max-md:pl-0 max-md:border-l-0"
      />
      <Stat
        label={t("stats.messagesOnPage")}
        dot="bg-[#2563eb]"
        value={formatNumber(totalMessages)}
        hint={t("stats.messagesHint", { count: lineUsers.length })}
        isLoading={isLoading}
        className="border-l border-border px-6 max-md:pl-6"
      />
      <Stat
        label={t("stats.activeWeek")}
        dot="bg-[#ea580c]"
        value={formatNumber(activeUsers.length)}
        hint={activeHint}
        isLoading={isLoading}
        className="border-l border-border pl-6"
      />
    </div>
  );
};

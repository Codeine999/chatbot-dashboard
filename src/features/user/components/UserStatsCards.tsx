import { useTranslation } from "react-i18next";
import { UserRoundCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { LineMark } from "./UserVisuals";
import type { UserTabCounts } from "../type";

const StatCard = ({
  label,
  value,
  hint,
  icon,
  iconTone,
  isLoading,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  iconTone: string;
  isLoading: boolean;
}) => (
  <Card className="group flex min-w-0 flex-row items-start justify-between gap-4 p-5 transition-shadow hover:shadow-lg">
    <div className="min-w-0">
      <p className="text-xs font-medium tracking-wide text-mini uppercase">{label}</p>

      {isLoading ? (
        <Skeleton className="mt-2.5 h-9 w-20" />
      ) : (
        <p className="mt-1.5 text-3xl font-semibold tabular-nums text-normal">
          {formatNumber(value)}
        </p>
      )}

      <p className="mt-1.5 truncate text-xs text-mini">{hint}</p>
    </div>

    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
        iconTone
      )}
    >
      {icon}
    </span>
  </Card>
);

/**
 * ตัวเลขรวมของทั้งสองแท็บ ไม่ผูกกับแท็บที่เปิดอยู่ จึงค้างอยู่ตลอดเวลาสลับแท็บ
 * การ์ดกินความกว้างไม่เกินครึ่งหนึ่งของหน้า ชิดซ้าย
 */
export const UserStatsCards = ({
  counts,
  isLoading,
}: {
  counts?: UserTabCounts;
  isLoading: boolean;
}) => {
  const { t } = useTranslation("users");

  const registered = counts?.registered ?? 0;
  const line = counts?.line ?? 0;
  const contacts = registered + line;
  // สัดส่วนคนที่สมัครแล้วจากผู้ติดต่อทั้งหมด บอกได้ทันทีว่าเหลือให้ตามอีกเท่าไร
  const convertedPercent = contacts ? Math.round((registered / contacts) * 100) : 0;

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-[50%]">
      <StatCard
        label={t("stats.registered")}
        value={registered}
        hint={t("stats.registeredHint", { percent: convertedPercent })}
        isLoading={isLoading}
        iconTone="bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
        icon={<UserRoundCheck className="size-5" />}
      />

      <StatCard
        label={t("stats.lineUsers")}
        value={line}
        hint={t("stats.lineUsersHint")}
        isLoading={isLoading}
        iconTone="bg-gradient-to-br from-[#06C755]/25 to-[#06C755]/5"
        icon={<LineMark className="size-6 rounded-[9px]" />}
      />
    </div>
  );
};

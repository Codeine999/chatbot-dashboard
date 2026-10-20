import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IconTile, type IconTileTone } from "./IconTile";

type Props = {
  label: string;
  value: ReactNode;
  /** บรรทัดเล็กใต้ตัวเลข ส่งเป็นลิงก์/ปุ่มได้ */
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: IconTileTone;
  isLoading?: boolean;
  className?: string;
};

export const StatCard = ({
  label,
  value,
  hint,
  icon,
  tone,
  isLoading = false,
  className,
}: Props) => (
  <Card className={cn("flex items-start justify-between gap-3 p-5", className)}>
    <div className="min-w-0">
      <p className="text-sm text-mini">{label}</p>

      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums text-normal">{value}</p>
      )}

      {hint && <div className="mt-2 truncate text-xs text-mini">{hint}</div>}
    </div>

    <IconTile icon={icon} tone={tone} size="sm" />
  </Card>
);

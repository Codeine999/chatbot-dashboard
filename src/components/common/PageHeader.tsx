import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  /** ของที่อยู่หน้าชื่อหน้า เช่น IconTile หรือปุ่มย้อนกลับ */
  leading?: ReactNode;
  /** ปุ่มฝั่งขวาของหัวหน้า */
  actions?: ReactNode;
  className?: string;
};

/** หัวหน้าแบบเดียวกับหน้าคลังความรู้ AI */
export const PageHeader = ({ title, subtitle, leading, actions, className }: Props) => (
  <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
    <div className="flex min-w-0 items-center gap-3">
      {leading}
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-normal">{title}</h1>
        {subtitle && <p className="text-sm text-mini">{subtitle}</p>}
      </div>
    </div>

    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

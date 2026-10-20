import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DotBadgeTone = "success" | "neutral" | "warning" | "danger";

const TONES: Record<DotBadgeTone, string> = {
  success: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

/** ป้ายสถานะมีจุดสีนำหน้า จุดใช้สีเดียวกับตัวอักษร */
export const DotBadge = ({
  tone,
  children,
  className,
}: {
  tone: DotBadgeTone;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium",
      TONES[tone],
      className
    )}
  >
    <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
    {children}
  </span>
);

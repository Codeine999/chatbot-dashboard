import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile } from "./IconTile";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** ปุ่มหรือการ์ดทางเลือกใต้ข้อความ */
  children?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, description, children, className }: Props) => (
  <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
    <IconTile icon={icon} size="lg" />
    <h2 className="mt-4 text-base font-semibold text-normal">{title}</h2>
    {description && <p className="mt-1 max-w-xl text-sm text-mini">{description}</p>}
    {children && <div className="mt-8 w-full">{children}</div>}
  </div>
);

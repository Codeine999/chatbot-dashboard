import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile, type IconTileTone } from "./IconTile";

type Props = {
  icon: LucideIcon;
  tone?: IconTileTone;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
};

/** การ์ดทางเลือกแบบกดได้ทั้งใบ เช่น ทางเลือกเริ่มต้นใน empty state */
export const ActionTile = ({ icon, tone, title, description, onClick, className }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full cursor-pointer flex-col items-start rounded-xl border p-4 text-left transition",
      "hover:border-primary/30 hover:bg-hover/40",
      "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className
    )}
  >
    <IconTile icon={icon} tone={tone} size="sm" />
    <span className="mt-4 text-sm font-medium text-normal">{title}</span>
    {description && <span className="mt-0.5 text-xs text-mini">{description}</span>}
  </button>
);

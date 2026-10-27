import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** แถวเมนูไอคอน + ข้อความ ใช้ร่วมกันทุกแถวบนสุดให้แนวไอคอนตรงกัน */
export const SidebarNavRow = ({
  icon: Icon,
  label,
  active,
  iconClassName,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  iconClassName?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm text-normal transition-colors hover:bg-hover",
      active && "bg-hover"
    )}
  >
    <Icon className={cn("size-[18px] shrink-0", iconClassName)} aria-hidden />
    <span className="truncate">{label}</span>
  </button>
);

/** หัวกลุ่มตัวเล็กสีเทา กดแล้วพับ/กาง */
export const SidebarSectionToggle = ({
  label,
  collapsed,
  onToggle,
}: {
  label: string;
  collapsed: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={!collapsed}
    className="flex cursor-pointer items-center gap-1 px-3 pb-1.5 text-xs text-mini transition hover:text-normal"
  >
    {label}
    <ChevronDown className={cn("size-3 transition-transform", collapsed && "-rotate-90")} />
  </button>
);

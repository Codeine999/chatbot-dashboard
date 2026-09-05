import type { LucideIcon } from "lucide-react";

export type MenuFilter = "all" | "enabled" | "disabled" | "required";

export type SidebarMenuOption = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** หัวข้อกลุ่มใน sidebar เช่น Workspace / Communication */
  group: string;
  badge?: string;
  /** เมนูบังคับ ปิดไม่ได้ */
  required?: boolean;
  enabled: boolean;
};

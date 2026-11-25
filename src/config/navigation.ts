import {
  Home,
  Inbox,
  Search,
  Settings,
  UsersRound,
  MessagesSquare,
  ChartPie,
  BarChart3,
  MessageCircle,
  Receipt,
  LayoutGrid,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/features/auth/types/auth.type";

export type NavItem = {
  /** key ใน namespace "nav" ไม่ใช่ข้อความจริง แปลตอน render */
  titleKey: string;
  url: string;
  icon: LucideIcon;
  /** ถ้าระบุไว้ เมนูจะขึ้นเฉพาะ role ที่อยู่ในลิสต์ ไม่ระบุ = เห็นทุก role */
  roles?: AdminRole[];
  /** ป้ายเล็กท้ายเมนู เช่น AI / Beta — เป็นชื่อเฉพาะ ไม่ต้องแปล */
  badge?: string;
  /** ถ้ามี children เมนูจะกลายเป็น dropdown แทนการลิงก์ตรง */
  children?: { titleKey: string; url: string; roles?: AdminRole[] }[];
};

export type NavGroup = {
  labelKey: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    labelKey: "group.workspace",
    items: [
      { titleKey: "item.home", url: "/", icon: Home },
      { titleKey: "item.richMenu", url: "/rich-menu/setting", icon: LayoutGrid },
      { titleKey: "item.product", url: "/product", icon: Inbox, roles: ["dev"] },
      // { titleKey: "item.order", url: "/order", icon: Calendar },
      { titleKey: "item.users", url: "/users", icon: UsersRound },
    ],
  },
  {
    labelKey: "group.communication",
    items: [
      { titleKey: "item.lineChat", url: "/chat/line", icon: MessageCircle },
      { titleKey: "item.answer", url: "/ai-answer", icon: Search },
      { titleKey: "item.internalCustomerChat", url: "/ai/internal-customer-chat", icon: MessageCircle },
      { titleKey: "item.aiChatbot", url: "/ai-chat", icon: MessagesSquare, badge: "AI" },
    ],
  },
  {
    labelKey: "group.insights",
    items: [
      // { titleKey: "item.overview", url: "../", icon: Search },
      {
        titleKey: "item.usage",
        url: "/usage",
        icon: ChartPie,
        children: [
          { titleKey: "item.usageOverall", url: "/usage", roles: ["dev"] },
          { titleKey: "item.usageGraph", url: "/usage/Graph" },
        ],
      },
      {
        titleKey: "item.analytics",
        url: "/report/analytics",
        icon: BarChart3,
        roles: ["dev"],
        children: [
          { titleKey: "item.analyticsChat", url: "/report/analytics/chat", roles: ["dev"] },
        ],
      },
      { titleKey: "item.bill", url: "/bill", icon: Receipt, roles: ["dev"] },
      {
        titleKey: "item.adminList",
        url: "/admin-list",
        icon: ShieldCheck,
        roles: ["admin", "owner", "dev"],
      },
    ],
  },
  {
    labelKey: "group.system",
    items: [
      {
        titleKey: "item.setting",
        url: "/setting",
        icon: Settings,
        children: [
          // { titleKey: "item.settingOverall", url: "/setting/admin/over-all" },
          // { titleKey: "item.settingSelectMenu", url: "/setting/admin/select-menu" },
          { titleKey: "item.settingAi", url: "/setting/admin/ai-setting" },
          { titleKey: "item.settingConnection", url: "/setting/connection" },
          { titleKey: "item.settingClearSession", url: "/setting/clear-session", roles: ["owner", "dev"] },
        ],
      },
    ],
  },
];


/** แบนเมนูเป็นลิสต์เดียว (รวม children) สำหรับ command palette และหาชื่อหน้า */
export const flatNavEntries = navGroups.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children
      ? item.children.map((child) => ({ ...child, icon: item.icon, groupKey: group.labelKey, parentKey: item.titleKey }))
      : [{ titleKey: item.titleKey, url: item.url, roles: item.roles, icon: item.icon, groupKey: group.labelKey, parentKey: undefined as string | undefined }],
  ),
);

/** หา titleKey ของหน้าปัจจุบัน — match path ยาวสุดก่อน เพื่อให้ /usage/Graph ชนะ /usage */
export const findNavEntry = (pathname: string) =>
  [...flatNavEntries]
    .sort((a, b) => b.url.length - a.url.length)
    .find((entry) => (entry.url === "/" ? pathname === "/" : pathname === entry.url || pathname.startsWith(`${entry.url}/`)));

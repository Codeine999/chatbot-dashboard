import { NavLink } from "react-router-dom";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@/components/context/themeProvider"
import { useSidebar } from "@/components/ui/sidebar";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ChevronDown,
  UsersRound,
  MessagesSquare,
  ChartPie,
  MessageCircle,
  Receipt,
  Workflow,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

import NextIcons from "@/assets/nexticon.svg"
import NextIcon from "@/assets/next-icon.svg"
import { CardDescription, CardTitle } from "./ui/card";
import { useCompanyBrandInfo } from "@/features/company/hooks/useCompany";
import { resolveImageUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";


type NavItem = {
  /** key ใน namespace "nav" ไม่ใช่ข้อความจริง แปลตอน render */
  titleKey: string;
  url: string;
  icon: LucideIcon;
  /** ป้ายเล็กท้ายเมนู เช่น AI / Beta — เป็นชื่อเฉพาะ ไม่ต้องแปล */
  badge?: string;
  /** ถ้ามี children เมนูจะกลายเป็น dropdown แทนการลิงก์ตรง */
  children?: { titleKey: string; url: string }[];
};

type NavGroup = {
  labelKey: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    labelKey: "group.workspace",
    items: [
      { titleKey: "item.home", url: "/", icon: Home },
      { titleKey: "item.richMenu", url: "/rich-menu/setting", icon: LayoutGrid },
      { titleKey: "item.product", url: "/", icon: Inbox },
      { titleKey: "item.order", url: "/order", icon: Calendar },
      { titleKey: "item.users", url: "/users", icon: UsersRound },
    ],
  },
  {
    labelKey: "group.communication",
    items: [
      { titleKey: "item.lineChat", url: "/chat/line", icon: MessageCircle },
      { titleKey: "item.answer", url: "/ai-answer", icon: Search },
      { titleKey: "item.aiChatbot", url: "/ai-chat", icon: MessagesSquare, badge: "AI" },
    ],
  },
  {
    labelKey: "group.insights",
    items: [
      { titleKey: "item.overview", url: "../", icon: Search },
      {
        titleKey: "item.usage",
        url: "/usage",
        icon: ChartPie,
        children: [
          { titleKey: "item.usageOverall", url: "/usage" },
          { titleKey: "item.usageGraph", url: "/usage/Graph" },
        ],
      },
      { titleKey: "item.bill", url: "/bill", icon: Receipt },
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
          { titleKey: "item.settingOverall", url: "/setting/admin/over-all" },
          { titleKey: "item.settingSelectMenu", url: "/setting/admin/select-menu" },
        ],
      },
    ],
  },
];

/** active = พื้นม่วงอ่อน + ตัวอักษรม่วง + แถบม่วงชิดขอบซ้ายของ sidebar
 *  ต้องใส่ ! เพราะ variant `default` ของ SidebarMenuButton มี !bg/!text ของตัวเองอยู่ */
const menuButtonClass = cn(
  "relative rounded-lg font-normal text-normal transition-colors",
  "hover:bg-primary/5",
  "data-[active=true]:!bg-primary/10 data-[active=true]:!text-primary data-[active=true]:font-medium",
  "data-[active=true]:before:content-[''] data-[active=true]:before:absolute data-[active=true]:before:-left-2",
  "data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5",
  "data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full",
  "data-[active=true]:before:bg-primary"
);

const groupLabelClass =
  "px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

const NavBadge = ({ children }: { children: string }) => (
  <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
    {children}
  </span>
);

const SidebarNavigation = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { data: brandInfo } = useCompanyBrandInfo();
  const { t } = useTranslation("nav");

  const handleClose = () => {
    if (isMobile) {
      setOpenMobile(false)
      localStorage.setItem('sidebarMobileOpen', JSON.stringify(false))
    }
  }

  return (
    <SidebarRoot
      collapsible="icon"
      className={`transition-width duration-300 ease-in-out `}

    >
      <SidebarHeader className="py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <div className="flex items-center xl:gap-3 gap-4 ">
                  <div className={`duration-300 ease-in-out ${isCollapsed ? "w-6 -mx-1" : "w-8"
                    }`}>
                    {brandInfo?.image ? (
                      <img src={resolveImageUrl(brandInfo.image)} alt="logo" className="rounded-md object-cover" />
                    ) : theme === "dark" ? (
                      <img src={NextIcons} alt="logo" />
                    ) : (
                      <img src={NextIcon} alt="logo" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <CardTitle className="text-sm">{brandInfo?.name || t("brand.fallbackName")}</CardTitle>
                        <CardDescription className="text-[10px]">{t("brand.subtitle")}</CardDescription>
                      </div>

                      <ChevronDown className="w-4 h-4 text-normal" />
                    </div>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-1 overflow-x-hidden">
        {navGroups.map((group) => (
          <SidebarGroup key={group.labelKey} className="py-1">
            <SidebarGroupLabel className={groupLabelClass}>
              {t(group.labelKey)}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const isItemActive =
                    item.url === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.url);
                  const hasActiveChild = item.children?.some(
                    (child) => location.pathname === child.url
                  );

                  if (item.children) {
                    const firstChild = item.children[0];

                    // เมื่อ sidebar เป็นแถบไอคอน รายการย่อยของ Collapsible
                    // เลือกไม่ได้ จึงให้ปุ่มหลักเป็นลิงก์ไป child แรกแทน
                    if (isCollapsed && firstChild) {
                      return (
                        <SidebarMenuItem key={item.titleKey}>
                          <SidebarMenuButton
                            asChild
                            isActive={false}
                            className={menuButtonClass}
                          >
                            <NavLink to={firstChild.url} onClick={handleClose}>
                              <item.icon className="w-4.5 h-4.5" />
                              <span>{t(item.titleKey)}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    return (
                      <Collapsible
                        key={item.titleKey}
                        asChild
                        defaultOpen={hasActiveChild}
                        className="group/menu-collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={false}
                              className={cn(menuButtonClass, "cursor-pointer")}
                            >
                              <item.icon className="w-4.5 h-4.5" />
                              <span>{t(item.titleKey)}</span>
                              <ChevronDown
                                className="ml-auto size-4 transition-transform
                                  group-data-[state=open]/menu-collapsible:rotate-180"
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.titleKey}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === child.url}
                                    className="text-normal data-[active=true]:!bg-primary/10 data-[active=true]:!text-primary"
                                  >
                                    <NavLink to={child.url} onClick={handleClose}>
                                      <span>{t(child.titleKey)}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive}
                        className={menuButtonClass}
                      >
                        <NavLink to={item.url} onClick={handleClose}>
                          {/* icon กับ label ต้องเป็น child คนละตัวของปุ่ม
                              ไม่งั้นตอน sidebar ยุบเป็นแถบไอคอน CSS จะซ่อน label ไม่ได้ */}
                          <item.icon className="w-4.5 h-4.5" />
                          <span>{t(item.titleKey)}</span>
                          {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="py-1">
          <SidebarGroupLabel className={groupLabelClass}>{t("group.build")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={cn(menuButtonClass, "cursor-pointer")}>
                      <Workflow className="w-4.5 h-4.5" />
                      <span>{t("item.aiWorkflow")}</span>
                      <NavBadge>Beta</NavBadge>
                      <ChevronDown
                        className="size-4 transition-transform
                          group-data-[state=open]/collapsible:rotate-180"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <NavLink to="/#">
                            <Projector />
                            Ai Chat Bot
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem> */}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </SidebarRoot>
  );
};

export default SidebarNavigation;

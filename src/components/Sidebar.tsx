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
  type LucideIcon,
} from "lucide-react";

import NextIcons from "@/assets/nexticon.svg"
import NextIcon from "@/assets/next-icon.svg"
import { CardDescription, CardTitle } from "./ui/card";
import { useCompanyBrandInfo } from "@/features/company/hooks/useCompany";
import { resolveImageUrl } from "@/lib/url";
import { cn } from "@/lib/utils";


type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** ป้ายเล็กท้ายเมนู เช่น AI / Beta */
  badge?: string;
  /** ถ้ามี children เมนูจะกลายเป็น dropdown แทนการลิงก์ตรง */
  children?: { title: string; url: string }[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Product", url: "/product", icon: Inbox },
      { title: "Order", url: "/order", icon: Calendar },
      { title: "Users", url: "/users", icon: UsersRound },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Line Chat", url: "/chat/line", icon: MessageCircle },
      { title: "Answer", url: "/ai-answer", icon: Search },
      { title: "Ai Chatbot", url: "/ai-chat", icon: MessagesSquare, badge: "AI" },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Overview", url: "../", icon: Search },
      {
        title: "Usage",
        url: "/usage",
        icon: ChartPie,
        children: [
          { title: "Over All", url: "/usage" },
          { title: "Usage Graph", url: "/usage/Graph" },
        ],
      },
      { title: "Bill", url: "/bill", icon: Receipt },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Setting",
        url: "/setting",
        icon: Settings,
        children: [
          { title: "Over All", url: "/setting/admin/over-all" },
          { title: "Select Menu", url: "/setting/admin/select-menu" },
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
                        <CardTitle className="text-sm">{brandInfo?.name || "Dashboard"}</CardTitle>
                        <CardDescription className="text-[10px]">Admin Managent</CardDescription>
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
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className={groupLabelClass}>
              {group.label}
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
                    return (
                      <Collapsible
                        key={item.title}
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
                              <span>{item.title}</span>
                              <ChevronDown
                                className="ml-auto size-4 transition-transform
                                  group-data-[state=open]/menu-collapsible:rotate-180"
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === child.url}
                                    className="text-normal data-[active=true]:!bg-primary/10 data-[active=true]:!text-primary"
                                  >
                                    <NavLink to={child.url} onClick={handleClose}>
                                      <span>{child.title}</span>
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
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive}
                        className={menuButtonClass}
                      >
                        <NavLink to={item.url} onClick={handleClose}>
                          {/* icon กับ label ต้องเป็น child คนละตัวของปุ่ม
                              ไม่งั้นตอน sidebar ยุบเป็นแถบไอคอน CSS จะซ่อน label ไม่ได้ */}
                          <item.icon className="w-4.5 h-4.5" />
                          <span>{item.title}</span>
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
          <SidebarGroupLabel className={groupLabelClass}>Build</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={cn(menuButtonClass, "cursor-pointer")}>
                      <Workflow className="w-4.5 h-4.5" />
                      <span>Ai Work Flow</span>
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

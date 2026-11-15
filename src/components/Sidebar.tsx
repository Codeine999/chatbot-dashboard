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
  ChevronDown,
  Sparkles,
  Workflow,
} from "lucide-react";

import NextIcons from "@/assets/nexticon.svg"
import NextIcon from "@/assets/next-icon.svg"
import { CardDescription, CardTitle } from "./ui/card";
import { useCompanyBrandInfo } from "@/features/company/hooks/useCompany";
import { resolveImageUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChatSidebarPanel } from "@/features/chatbot/components/ChatSidebarPanel";
import { AI_CHAT_URL, useIsAiChatRoute } from "@/features/chatbot/lib/chatRoute";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { navGroups } from "@/config/navigation";
import type { AdminRole } from "@/features/auth/types/auth.type";


/** active = พื้นแดงอ่อน + ตัวอักษรแดง + แถบแดงชิดขอบซ้ายของ sidebar
 *  ต้องใส่ ! เพราะ variant `default` ของ SidebarMenuButton มี !bg/!text ของตัวเองอยู่ */
const menuButtonClass = cn(
  "relative rounded-lg font-normal text-normal transition-colors",
  "hover:bg-button-primary/5",
  "data-[active=true]:!bg-button-primary/10 data-[active=true]:!text-button-primary data-[active=true]:font-medium",
  "data-[active=true]:before:content-[''] data-[active=true]:before:absolute data-[active=true]:before:-left-2",
  "data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5",
  "data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full",
  "data-[active=true]:before:bg-button-primary"
);

const groupLabelClass =
  "px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

const SWAP_TRANSITION = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

const NavBadge = ({ children }: { children: string }) => (
  <span className="ml-auto rounded-md bg-button-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-button-primary">
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
  const user = useAuthUser();
  const isAiChatActive = location.pathname === AI_CHAT_URL;
  const isChatRoute = useIsAiChatRoute();
  // แถบไอคอนไม่มีที่พอสำหรับรายการแชท จึงสลับเป็นโหมดแชทเฉพาะตอน sidebar กางอยู่ (มือถือกางเสมอ)
  const showChatPanel = isChatRoute && (isMobile || !isCollapsed);

  /** ไม่ระบุ roles = เห็นทุก role */
  const canSee = (roles?: AdminRole[]) => !roles || (!!user && roles.includes(user.role));

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
      {/* สลับเนื้อ sidebar แบบม่านรูดจากล่างขึ้นบน: เมนูเดิมพับเก็บขึ้นบน แล้ว sidebar ของ AI Chat โผล่แทน */}
      <AnimatePresence mode="wait" initial={false}>
        {showChatPanel ? (
          <motion.div
            key="chat"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={SWAP_TRANSITION}
          >
            <ChatSidebarPanel onExit={handleClose} />
          </motion.div>
        ) : (
          <motion.div
            key="nav"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={SWAP_TRANSITION}
          >
      <SidebarHeader className="py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <div className="flex w-full items-center gap-3">
                  <div className={`shrink-0 duration-300 ease-in-out ${isCollapsed ? "w-6 -mx-1" : "w-8"
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
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <CardTitle className="text-sm">{brandInfo?.name || t("brand.fallbackName")}</CardTitle>
                        <CardDescription className="text-[10px]">{t("brand.subtitle")}</CardDescription>
                      </div>

                      <ChevronDown className="size-4 shrink-0 text-normal" />
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
                {group.items
                  .filter((item) => canSee(item.roles))
                  .map((item) => ({
                    ...item,
                    children: item.children?.filter((child) => canSee(child.roles)),
                  }))
                  .map((item) => {
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
                                    className="text-normal data-[active=true]:!bg-button-primary/10 data-[active=true]:!text-button-primary"
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
              {/* เมนูแยกเดี่ยว ไม่อยู่ใน dropdown AI Work Flow (ปิดไว้ชั่วคราว เปลี่ยน SHOW_AI_HELP_MENU เป็น true เพื่อเปิด) */}
              {SHOW_AI_HELP_MENU && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isAiChatActive}
                  className={menuButtonClass}
                >
                  <NavLink to={AI_CHAT_URL} onClick={handleClose}>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>{t("item.callAiHelp")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )}

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
          </motion.div>
        )}
      </AnimatePresence>
      <SidebarFooter />
    </SidebarRoot>
  );
};

/** เมนู "ให้ AI ช่วยคุณ" ปิดไว้ก่อน */
const SHOW_AI_HELP_MENU = false;

export default SidebarNavigation;

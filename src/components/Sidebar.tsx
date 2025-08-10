import { NavLink } from "react-router-dom";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@/components/context/themeProvider"
import { useSidebar } from "@/components/ui/sidebar";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
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
  Projector,
  MessagesSquare,
} from "lucide-react";

import NextIcons from "@/assets/nexticon.svg"
import NextIcon from "@/assets/next-icon.svg"
import { Button } from "./ui/button";
import { CardDescription, CardTitle } from "./ui/card";


const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Product",
    url: "/product",
    icon: Inbox,
  },
  {
    title: "Order",
    url: "/order",
    icon: Calendar,
  },
  {
    title: "Users",
    url: "/users",
    icon: UsersRound,
  },
  {
    title: "Overview",
    url: "../",
    icon: Search,
  },
  {
    title: "Ai Chatbot",
    url: "/ai-chat",
    icon: MessagesSquare,
  },

];

const sidebar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleClose = () => {
    if (isMobile) {
      setOpenMobile(false)
      localStorage.setItem('sidebarMobileOpen', JSON.stringify(false))
    }
  }

  return (
    <Sidebar
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
                    {theme === "dark" ? (
                      <img src={NextIcons} alt="logo" />
                    ) : (
                      <img src={NextIcon} alt="logo" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <CardTitle className="text-sm">Sasom.com</CardTitle>
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


      <SidebarContent className="overflow-x-hidden">
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="rounded-2xl">
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.url)
                    }
                  >
                    <NavLink to={item.url} onClick={handleClose}>
                      <p className=" font-normal flex items-center gap-2">
                        <item.icon className="w-4.5 h-4.5" />
                        {item.title}
                      </p>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Collapsible className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="cursor-pointer">
                      Ai Work Flow
                      <ChevronDown
                        className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180
                          cursor-pointer"
                      />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      {/* <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <NavLink to="/#">
                              <Projector />
                              Ai Chat Bot
                            </NavLink>


                          </SidebarMenuButton>
                        </SidebarMenuItem>

                      </SidebarMenu> */}
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default sidebar;






import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, Settings, User } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { resolveImageUrl } from "@/lib/url";
import { useSidebarLocked } from "@/lib/sidebarLock";
import { useNotificationSocket } from "@/features/notifications/hooks/useNotifications";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { truncateTitle } from "@/features/chatbot/lib/chatFormat";
import { useChatTitleStore } from "@/features/chatbot/store/chatTitle.store";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { SettingsDialog } from "@/features/setting/components/SettingsDialog";

const getInitials = (firstname = "", lastname = "", username = "") => {
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.trim();
  return (initials || username.slice(0, 2)).toUpperCase();
};

const Navbar = () => {
  const { t } = useTranslation("nav");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = useAuthUser();
  const logout = useLogout();
  const sidebarLocked = useSidebarLocked();
  const chatTitle = useChatTitleStore((state) => state.title);

  useNotificationSocket();
  return (
    <nav className="p-2 pt-3 flex items-center justify-between">

      {/* หน้าที่ล็อก sidebar ไว้ (หน้าแชท AI): ชื่อแบรนด์อยู่เหนือแถบประวัติแชท (กว้างเท่ากัน)
          ชื่อห้องแชทเริ่มตรงขอบซ้ายของพื้นที่แชท ฝั่งตรงข้ามกับโปรไฟล์ */}
      {sidebarLocked ? (
        <div className="flex min-w-0 flex-1 items-center">
          <p className="shrink-0 px-3 text-base font-semibold tracking-tight text-normal lg:w-[calc(18rem-0.5rem)]">
            {t("chat:header.brand")}
          </p>
          <h1 title={chatTitle ?? undefined} className="min-w-0 truncate px-2 text-sm font-medium text-normal sm:px-4">
            {chatTitle ? truncateTitle(chatTitle) : t("chat:header.defaultTitle")}
          </h1>
        </div>
      ) : (
        <div className="flex gap-2">
          <SidebarTrigger />
        </div>
      )}

      <div className="flex items-center">
        <div className="flex md:gap-4 gap-2 md:mx-2">
          <NotificationBell />

          <div className="mx-6">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={resolveImageUrl(user?.image)}
                    alt={user?.username ?? ""}
                  />
                  <AvatarFallback>
                    {getInitials(user?.firstname, user?.lastname, user?.username)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl mx-4 p-2">
                <DropdownMenuLabel>{user?.username ?? ""}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="!w-5 !h-5 mr-2" />
                  {t("user.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="!w-5 !h-5 mr-2" />
                  {t("user.setting")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="!w-5 !h-5 mr-2" />
                  {t("user.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </nav>
  );
};

export default Navbar;

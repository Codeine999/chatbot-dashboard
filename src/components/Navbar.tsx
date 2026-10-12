import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, Settings, User, Bell } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { resolveImageUrl } from "@/lib/url";
import { useSidebarLocked } from "@/lib/sidebarLock";
import { formatRelativeTime } from "@/lib/time";
import { useNavigate } from "react-router-dom";
import {
  useMarkNotificationAsRead,
  useNotificationSocket,
  useNotifications,
  useUnreadNotificationCount,
} from "@/features/notifications/hooks/useNotifications";
import type { AdminNotification } from "@/features/notifications/types/notification.type";
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
  const navigate = useNavigate();
  const sidebarLocked = useSidebarLocked();

  useNotificationSocket();
  const notificationsQuery = useNotifications();
  const unreadCountQuery = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadCountQuery.data ?? 0;

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.isRead) markAsRead.mutate(notification.id);
    const conversationId = notification.metadata?.conversationId;
    if (conversationId) {
      navigate(`/chat/line?conversationId=${conversationId}`);
    }
  };

  return (
    <nav className="p-2 pt-3 flex items-center justify-between">

      <div className="flex gap-2">
        {/* หน้าที่ล็อก sidebar ไว้ (เช่น chatbot) ซ่อนปุ่มขยายไปเลย */}
        {!sidebarLocked && <SidebarTrigger />}
      </div>

      <div className="flex items-center">
        <div className="flex md:gap-4 gap-2 md:mx-2">
          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <Button variant="nav" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-74 h-[320px] bg-background rounded-lg shadow-lg flex
                flex-col overflow-hidden"
            >

              <div className="p-2 px-4 sticky top-0">
                <p className="text-md text-mini font-medium">{t("notification.title")}</p>
              </div>

              <div className="overflow-y-auto px-1">
                {notifications.length === 0 && (
                  <p className="px-3 py-4 text-xs text-mini">{t("notification.empty")}</p>
                )}

                {notifications.map((notification) => {
                  const meta = notification.metadata;
                  const title = meta?.displayName ?? notification.title;
                  const preview = meta?.lastMessage ?? notification.message ?? "";

                  return (
                    <div key={notification.id} className="flex items-center space-x-3 py-1">
                      <DropdownMenuItem
                        className={`w-full cursor-pointer ${
                          notification.isRead ? "opacity-50" : "bg-accent/60"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {meta?.pictureUrl ? (
                          <img
                            src={meta.pictureUrl}
                            alt={title}
                            className="-mt-2 w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="-mt-2 w-8 h-8 bg-gray-300 rounded-full" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-md text-mini font-medium">{title}</span>
                          <span className="text-xs text-normal">{preview}</span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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

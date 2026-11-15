import { useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { SettingsDialog } from "@/features/setting/components/SettingsDialog";
import { resolveImageUrl } from "@/lib/url";

const getInitials = (firstname = "", lastname = "", username = "") => {
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.trim();
  return (initials || username.slice(0, 2)).toUpperCase();
};

export const UserMenu = () => {
  const { t } = useTranslation("nav");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = useAuthUser();
  const logout = useLogout();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none ring-2 ring-border ring-offset-2 ring-offset-background focus-visible:ring-ring">
          <Avatar className="size-9">
            <AvatarImage src={resolveImageUrl(user?.image)} alt={user?.username ?? ""} />
            <AvatarFallback>
              {getInitials(user?.firstname, user?.lastname, user?.username)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48 rounded-2xl p-2">
          <DropdownMenuLabel>{user?.username ?? ""}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 !size-5" />
            {t("user.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 !size-5" />
            {t("user.setting")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 !size-5" />
            {t("user.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};

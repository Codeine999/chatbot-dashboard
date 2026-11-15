import { useNotificationSocket } from "@/features/notifications/hooks/useNotifications";
import { useChatTitleStore } from "@/features/chatbot/store/chatTitle.store";
import { useIsAiChatRoute } from "@/features/chatbot/lib/chatRoute";
import { truncateTitle } from "@/features/chatbot/lib/chatFormat";
import { useTranslation } from "react-i18next";
import { CommandPalette } from "./CommandPalette";
import { NavbarActions } from "./NavbarActions";
import { NavbarTitle } from "./NavbarTitle";

/** หน้าแชท AI: ชื่อหน้าเป็นชื่อห้องแชท (ชื่อแบรนด์อยู่ใน sidebar แล้ว) */
const ChatNavbarTitle = () => {
  const { t } = useTranslation("chat");
  const chatTitle = useChatTitleStore((state) => state.title);

  return (
    <NavbarTitle
      title={chatTitle ? truncateTitle(chatTitle) : t("header.defaultTitle")}
      fullTitle={chatTitle ?? undefined}
    />
  );
};

/** แถบบนสไตล์ ElevenLabs: ซ้าย = trigger + ชื่อหน้า, ขวา = actions (⌘K เปิด command palette ได้อยู่) */
const Navbar = () => {
  const isChatRoute = useIsAiChatRoute();
  useNotificationSocket();

  return (
    <nav className="sticky top-0 z-30 flex h-[62px] items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      {isChatRoute ? <ChatNavbarTitle /> : <NavbarTitle />}
      <NavbarActions />
      <CommandPalette />
    </nav>
  );
};

export default Navbar;

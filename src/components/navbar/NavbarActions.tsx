import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useAdminToolChatStore } from "@/stores/adminToolChat.store";
import { AskIcon, FolderIcon } from "./icons";
import { UserMenu } from "./UserMenu";

/** ลิงก์ภายนอก ตั้งผ่าน .env (VITE_DOCS_URL / VITE_FEEDBACK_URL) ถ้าไม่ตั้งจะไม่แสดงปุ่ม */
const DOCS_URL = import.meta.env.VITE_DOCS_URL as string | undefined;
const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL as string | undefined;

/** กลุ่มปุ่มขวาของ navbar: Feedback / Docs / Ask / แจ้งเตือน / โปรไฟล์ */
export const NavbarActions = () => {
  const { t } = useTranslation("nav");
  const toggleAsk = useAdminToolChatStore((state) => state.setIsOpen);

  return (
    <div className="flex items-center justify-end gap-3">
      {FEEDBACK_URL && (
        <Button asChild variant="pill" size="pill" className="hidden lg:inline-flex">
          <a href={FEEDBACK_URL} target="_blank" rel="noreferrer">
            {t("navbar.feedback")}
          </a>
        </Button>
      )}
      {DOCS_URL && (
        <Button asChild variant="pill" size="pill" className="hidden lg:inline-flex">
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            {t("navbar.docs")}
          </a>
        </Button>
      )}
      <Button variant="pill" size="pill" onClick={() => toggleAsk(true)}>
        <AskIcon className="size-[18px] text-[#1b8fd6]" />
        <span className="hidden sm:inline">{t("navbar.ask")}</span>
      </Button>
      <Button asChild variant="pill" size="pill-icon" className="hidden sm:inline-flex">
        <Link to="/ai-answer" aria-label={t("navbar.files")}>
          <FolderIcon className="size-5" />
        </Link>
      </Button>
      <NotificationBell />
      <UserMenu />
    </div>
  );
};

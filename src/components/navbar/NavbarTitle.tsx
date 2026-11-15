import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarToggleIcon } from "./icons";
import { findNavEntry } from "@/config/navigation";

/** ปุ่มสลับ sidebar + ชื่อหน้าปัจจุบัน (อิงจาก nav config เดียวกับ sidebar) */
export const NavbarTitle = ({ title, fullTitle }: { title?: string; fullTitle?: string }) => {
  const { t } = useTranslation("nav");
  const { pathname } = useLocation();
  const entry = findNavEntry(pathname);
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex min-w-0 items-center gap-4">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <SidebarToggleIcon className="size-6" />
      </button>
      {title ? (
        <h1 title={fullTitle} className="truncate text-base font-medium text-foreground">{title}</h1>
      ) : (
        entry && <h1 className="truncate text-base font-medium text-foreground">{t(entry.titleKey)}</h1>
      )}
    </div>
  );
};

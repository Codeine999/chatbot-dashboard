import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { navGroups } from "@/config/navigation";
import { useHotkey } from "@/hooks/useHotkey";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { useCommandPaletteStore } from "@/stores/commandPalette.store";

/** ค้นหา/ไปหน้าต่าง ๆ ด้วย ⌘K — รายการมาจาก nav config จึงตรงกับ sidebar เสมอ */
export const CommandPalette = () => {
  const { t } = useTranslation("nav");
  const navigate = useNavigate();
  const role = useAuthUser()?.role;
  const open = useCommandPaletteStore((state) => state.open);
  const setOpen = useCommandPaletteStore((state) => state.setOpen);
  const toggle = useCommandPaletteStore((state) => state.toggle);

  useHotkey("k", useCallback(toggle, [toggle]));

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title={t("navbar.search")}>
      <CommandInput placeholder={t("navbar.search")} />
      <CommandList>
        <CommandEmpty>{t("navbar.noResults")}</CommandEmpty>
        {navGroups.map((group) => (
          <CommandGroup key={group.labelKey} heading={t(group.labelKey)}>
            {group.items.flatMap((item) =>
              (item.children ?? [{ ...item, children: undefined }])
                .filter((entry) => !("roles" in entry) || !entry.roles || (role && entry.roles.includes(role)))
                .map((entry) => (
                  <CommandItem
                    key={entry.url}
                    value={`${t(entry.titleKey)} ${entry.url}`}
                    onSelect={() => go(entry.url)}
                  >
                    <item.icon />
                    {t(entry.titleKey)}
                  </CommandItem>
                )),
            )}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

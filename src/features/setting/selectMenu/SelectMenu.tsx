import { useMemo, useState } from "react";
import { Info, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MenuOptionRow } from "./components/MenuOptionRow";
import { menuGroupOrder, sidebarMenuOptionsMock } from "./mock/selectMenu.mock";
import type { MenuFilter, SidebarMenuOption } from "./type";
import { useTranslation } from "react-i18next";

const filterOptions: { value: MenuFilter; labelKey: string }[] = [
  { value: "all", labelKey: "filter.all" },
  { value: "enabled", labelKey: "filter.enabled" },
  { value: "disabled", labelKey: "filter.disabled" },
  { value: "required", labelKey: "filter.required" },
];

export const SelectMenu = () => {
  const { t } = useTranslation("settings");
  const [options, setOptions] = useState<SidebarMenuOption[]>(sidebarMenuOptionsMock);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MenuFilter>("all");

  const handleToggle = (id: string, enabled: boolean) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === id && !option.required ? { ...option, enabled } : option
      )
    );
  };

  /** เมนูบังคับไม่นับรวม เพราะปิดไม่ได้อยู่แล้ว */
  const optionalOptions = options.filter((option) => !option.required);
  const allOptionalOn =
    optionalOptions.length > 0 && optionalOptions.every((option) => option.enabled);

  const handleToggleAll = (enabled: boolean) => {
    setOptions((prev) =>
      prev.map((option) => (option.required ? option : { ...option, enabled }))
    );
  };

  const visibleOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return options.filter((option) => {
      const matchesSearch =
        !keyword ||
        option.title.toLowerCase().includes(keyword) ||
        option.description.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" ||
        (filter === "enabled" && option.enabled) ||
        (filter === "disabled" && !option.enabled) ||
        (filter === "required" && option.required);

      return matchesSearch && matchesFilter;
    });
  }, [options, search, filter]);

  const groups = menuGroupOrder
    .map((group) => ({
      label: group,
      items: visibleOptions.filter((option) => option.group === group),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="mt-10 mb-12">
      <div>
        <h1 className="text-2xl font-semibold text-normal">{t("selectMenu.title")}</h1>
        <p className="mt-2 text-sm text-mini">{t("selectMenu.subtitle")}</p>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[13px] text-normal">{t("selectMenu.hint")}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
            <Search className="w-4 text-gray-400" />
          </div>
          <Input
            placeholder={t("selectMenu.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 bg-gray-50 pl-10 text-[14px] placeholder:text-[14px]"
          />
        </div>

        <Select value={filter} onValueChange={(value) => setFilter(value as MenuFilter)}>
          <SelectTrigger className="w-full !h-10 sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-4 overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3.5">
            <p className="text-sm font-medium text-normal">{t("selectMenu.showAllOptional")}</p>
            <Switch
              checked={allOptionalOn}
              onCheckedChange={handleToggleAll}
              aria-label={t("selectMenu.showAllOptional")}
            />
          </div>

          {groups.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-mini">
              {t("selectMenu.noResults")}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((option) => (
                  <MenuOptionRow
                    key={option.id}
                    option={option}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import { useTranslation } from "react-i18next";
import { Copy, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/i18n/format";
import { cn } from "@/lib/utils";

import { MenuThumbnail } from "./MenuThumbnail";
import { Segmented } from "./Segmented";
import type { RichMenu, RichMenuFilter } from "../type";

const StatusPill = ({ menu }: { menu: RichMenu }) => {
  const { t } = useTranslation("richMenu");

  const tone = menu.active
    ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
    : menu.source === "line"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";

  const label = menu.active
    ? t("status.active")
    : menu.source === "line"
      ? t("status.published")
      : t("status.draft");

  return (
    <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium", tone)}>
      {label}
    </span>
  );
};

const MenuRow = ({
  menu,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  menu: RichMenu;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation("richMenu");

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-xl border p-2 transition-colors",
        isSelected
          ? "border-primary/35 bg-primary/5"
          : "border-transparent hover:bg-hover"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-start gap-2.5 text-left outline-none"
      >
        <MenuThumbnail menu={menu} className="w-13 shrink-0" />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-medium text-normal">{menu.name}</span>
            <StatusPill menu={menu} />
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-mini">
            {menu.lineId ?? t("list.notPublished")}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-mini">
            {t("list.updated", { date: formatDate(menu.updatedAt) })}
          </span>
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("list.actions")}
            className="size-7 shrink-0 text-mini opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={onDuplicate}>
            <Copy className="size-4" />
            {t("list.duplicate")}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-4" />
            {t("list.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const RichMenuList = ({
  menus,
  counts,
  selectedMenuId,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
}: {
  menus: RichMenu[];
  counts: Record<RichMenuFilter, number>;
  selectedMenuId: string;
  search: string;
  filter: RichMenuFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: RichMenuFilter) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useTranslation("richMenu");

  return (
    <Card className="flex h-fit flex-col gap-3 p-3">
      <Button
        variant="outline"
        onClick={onCreate}
        className="w-full border-dashed text-[13px] font-medium"
      >
        <Plus className="size-4" />
        {t("list.create")}
      </Button>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-mini" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("list.searchPlaceholder")}
          className="h-9 bg-background/60 pl-9 text-[13px] placeholder:text-[13px]"
        />
      </div>

      <Segmented
        value={filter}
        onChange={onFilterChange}
        options={[
          { value: "all", label: t("filter.all"), count: counts.all },
          { value: "draft", label: t("filter.draft"), count: counts.draft },
          { value: "line", label: t("filter.line"), count: counts.line },
        ]}
      />

      <div className="flex max-h-[30rem] flex-col gap-1 overflow-y-auto xl:max-h-[34rem]">
        {menus.length === 0 ? (
          <p className="py-10 text-center text-xs text-mini">{t("list.empty")}</p>
        ) : (
          menus.map((menu) => (
            <MenuRow
              key={menu.id}
              menu={menu}
              isSelected={menu.id === selectedMenuId}
              onSelect={() => onSelect(menu.id)}
              onDuplicate={() => onDuplicate(menu.id)}
              onDelete={() => onDelete(menu.id)}
            />
          ))
        )}
      </div>
    </Card>
  );
};

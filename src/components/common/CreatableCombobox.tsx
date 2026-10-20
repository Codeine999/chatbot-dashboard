import { useState, type ComponentProps } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<"button">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder?: string;
  /** พิมพ์ค่าที่ยังไม่มีในลิสต์แล้วสร้างใหม่ได้ */
  creatable?: boolean;
  /** แสดงตัวเลือกล้างค่า สำหรับช่องที่ไม่บังคับกรอก */
  clearable?: boolean;
  maxLength?: number;
};

/**
 * select ที่ค้นหาได้และเพิ่มตัวเลือกใหม่ได้ทันที
 * props ที่เหลือส่งต่อให้ปุ่ม trigger จึงใช้ใต้ <FormControl> ได้ (id / aria-invalid มาครบ)
 */
export const CreatableCombobox = ({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  creatable = true,
  clearable = false,
  maxLength,
  className,
  disabled,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const keyword = query.trim();
  const canCreate =
    creatable &&
    keyword.length > 0 &&
    !options.some((option) => option.toLocaleLowerCase() === keyword.toLocaleLowerCase());

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const select = (next: string) => {
    onChange(next);
    handleOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          <span className={cn("truncate", value ? "text-normal" : "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            maxLength={maxLength}
            placeholder={searchPlaceholder ?? t("combobox.search")}
          />
          <CommandList>
            <CommandEmpty>
              {creatable ? t("combobox.typeToCreate") : t("state.noResults")}
            </CommandEmpty>

            {options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => select(option)}>
                    <Check
                      className={cn("size-4", option === value ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {(canCreate || (clearable && value)) && (
              <CommandGroup forceMount className="border-t">
                {canCreate && (
                  <CommandItem
                    forceMount
                    value={`__create__${keyword}`}
                    onSelect={() => select(keyword)}
                    className="text-icons"
                  >
                    <Plus className="size-4 text-icons" aria-hidden />
                    {t("combobox.create", { value: keyword })}
                  </CommandItem>
                )}
                {clearable && value && (
                  <CommandItem forceMount value="__clear__" onSelect={() => select("")}>
                    <X className="size-4" aria-hidden />
                    {t("combobox.clear")}
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

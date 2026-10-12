import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateKnowledgeCategory } from "../hooks/useKnowledge";
import type { SysCategory } from "../type/knowledge.type";

/** แถวของ chip ที่เพิ่ม/ลบได้ ใช้ทั้ง keywords และ example questions */
export const ChipEditor = ({
  values,
  addLabel,
  onChange,
}: {
  values: string[];
  addLabel: string;
  onChange: (next: string[]) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const commit = () => {
    const value = text.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setText("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border p-2">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-md bg-hover px-2 py-1 text-xs text-normal"
        >
          {value}
          <button
            type="button"
            onClick={() => onChange(values.filter((item) => item !== value))}
            aria-label={`Remove ${value}`}
            className="text-mini transition hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setText("");
              setAdding(false);
            }
          }}
          className="w-28 bg-transparent px-1 text-xs text-normal outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-icons transition hover:bg-hover"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      )}
    </div>
  );
};

export const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <p className="mb-1.5 text-xs font-medium text-normal">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </p>
    {children}
  </div>
);

export const CategorySelect = ({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: SysCategory[];
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation("knowledge");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const createCategory = useCreateKnowledgeCategory();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAdding(false);
      setName("");
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existing = categories.find(
      (category) => category.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase()
    );
    if (existing) {
      onChange(existing.name);
      handleOpenChange(false);
      return;
    }

    try {
      const created = await createCategory.mutateAsync(trimmedName);
      onChange(created.name);
      handleOpenChange(false);
    } catch {
      // The mutation displays the API error and keeps the input open for retry.
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm text-normal shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className={value ? "truncate" : "truncate text-mini"}>
            {value || t("panel.categoryPlaceholder")}
          </span>
          <ChevronDown className="size-4 shrink-0 text-mini" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1"
      >
        <div className="max-h-64 overflow-y-auto py-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onChange(category.name);
                handleOpenChange(false);
              }}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm text-normal outline-none transition hover:bg-accent"
            >
              <span className="truncate">{category.name}</span>
              {category.name === value && <Check className="size-4 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="border-t p-1 pt-2">
          {adding ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={name}
                maxLength={100}
                placeholder={t("panel.newCategoryPlaceholder")}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSave();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setAdding(false);
                    setName("");
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={!name.trim() || createCategory.isPending}
                onClick={() => void handleSave()}
              >
                {createCategory.isPending ? t("panel.saving") : t("panel.save")}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm font-medium text-icons outline-none transition hover:bg-accent"
            >
              <Plus className="size-4" />
              {t("panel.addMore")}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

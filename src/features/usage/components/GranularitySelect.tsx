import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRANULARITY_OPTIONS } from "../lib/metrics";
import type { Granularity } from "../type/analytics.type";
import { useTranslation } from "react-i18next";

type Props = {
  value: Granularity;
  onChange: (value: Granularity) => void;
  /** tabs = แถบสลับแบบ segmented (หน้า Home) */
  variant?: "select" | "tabs";
};

/** ตัวเลือกช่วงเวลาประจำกราฟแต่ละใบ */
export const GranularitySelect = ({ value, onChange, variant = "select" }: Props) => {
  const { t } = useTranslation("usage");

  if (variant === "tabs") {
    return (
      <div
        role="tablist"
        aria-label={t("granularity.selectLabel")}
        className="flex gap-0.5 rounded-[10px] bg-muted p-[3px]"
      >
        {GRANULARITY_OPTIONS.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.value)}
              className={`cursor-pointer whitespace-nowrap h-8 rounded-lg px-3 text-[13px] outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                isActive
                  ? "bg-background font-medium text-foreground shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]"
                  : "font-medium text-normal hover:text-foreground"
              }`}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
  <Select value={value} onValueChange={(next) => onChange(next as Granularity)}>
    <SelectTrigger
      size="sm"
      className="h-8 w-[112px] rounded-lg text-xs font-medium"
      aria-label={t("granularity.selectLabel")}
    >
      <SelectValue />
    </SelectTrigger>

    <SelectContent align="end">
      {GRANULARITY_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value} className="text-xs">
          {t(option.labelKey)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  );
};

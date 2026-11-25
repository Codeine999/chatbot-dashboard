import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedTabs } from "@/components/motion";
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
export const GranularitySelect = ({
  value,
  onChange,
  variant = "select",
}: Props) => {
  const { t } = useTranslation("usage");

  if (variant === "tabs") {
    return (
      <SegmentedTabs
        value={value}
        onChange={onChange}
        ariaLabel={t("granularity.selectLabel")}
        options={GRANULARITY_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        }))}
      />
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as Granularity)}
    >
      <SelectTrigger
        size="sm"
        className="h-8 w-[112px] rounded-lg text-xs font-medium"
        aria-label={t("granularity.selectLabel")}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        {GRANULARITY_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs"
          >
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

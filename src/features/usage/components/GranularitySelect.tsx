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
};

/** ตัวเลือกช่วงเวลาประจำกราฟแต่ละใบ */
export const GranularitySelect = ({ value, onChange }: Props) => {
  const { t } = useTranslation("usage");

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

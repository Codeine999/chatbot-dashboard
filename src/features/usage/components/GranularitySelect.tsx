import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRANULARITY_OPTIONS } from "../lib/metrics";
import type { Granularity } from "../type/analytics.type";

type Props = {
  value: Granularity;
  onChange: (value: Granularity) => void;
};

/** ตัวเลือกช่วงเวลาประจำกราฟแต่ละใบ */
export const GranularitySelect = ({ value, onChange }: Props) => (
  <Select value={value} onValueChange={(next) => onChange(next as Granularity)}>
    <SelectTrigger
      size="sm"
      className="h-8 w-[112px] rounded-lg text-xs font-medium"
      aria-label="Select time range"
    >
      <SelectValue />
    </SelectTrigger>

    <SelectContent align="end">
      {GRANULARITY_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value} className="text-xs">
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

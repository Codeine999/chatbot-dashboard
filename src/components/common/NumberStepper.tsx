import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** ชื่อของตัวเลขสำหรับ screen reader */
  label: string;
  className?: string;
};

/** ปุ่ม − ตัวเลข + พิมพ์ตัวเลขเองได้ ค่าถูกบีบให้อยู่ในช่วง min–max เสมอ */
export const NumberStepper = ({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled = false,
  label,
  className,
}: Props) => {
  const { t } = useTranslation();
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - step))}
        aria-label={t("actions.decrease")}
      >
        <Minus />
      </Button>

      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => {
          const next = Math.trunc(Number(event.target.value));
          if (Number.isFinite(next)) onChange(clamp(next));
        }}
        className="h-9 w-12 [appearance:textfield] bg-transparent text-center text-sm font-medium tabular-nums text-normal outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + step))}
        aria-label={t("actions.increase")}
      >
        <Plus />
      </Button>
    </div>
  );
};

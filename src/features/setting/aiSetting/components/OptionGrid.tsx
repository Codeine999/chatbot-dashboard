import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OptionGridItem<T extends string> = {
  value: T;
  label: string;
  description?: ReactNode;
  /** อิโมจิหรือไอคอนเล็กหน้าชื่อ */
  leading?: ReactNode;
};

type Props<T extends string> = {
  label: string;
  value: T | null;
  /** NoInfer: ให้ T มาจาก options เท่านั้น ส่ง setter ตรง ๆ ได้ */
  onChange: (value: NoInfer<T>) => void;
  options: OptionGridItem<T>[];
  className?: string;
};

/**
 * ตัวเลือกแบบการ์ดเรียงเป็นตาราง ใช้ input radio จริงข้างใต้
 * จึงเลื่อนด้วยลูกศรและอ่านด้วย screen reader ได้เหมือน radio ปกติ
 */
export function OptionGrid<T extends string>({ label, value, onChange, options, className }: Props<T>) {
  const name = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-normal">{label}</legend>
      <div className={cn("grid gap-2", className)}>
        {options.map((option) => {
          const checked = option.value === value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2.5 transition-colors",
                "has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
                checked
                  ? "border-primary bg-primary/5 shadow-[0_0_0_1px_var(--primary)]"
                  : "bg-card/60 hover:bg-hover/60"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  checked ? "text-primary" : "text-normal"
                )}
              >
                {option.leading && <span aria-hidden>{option.leading}</span>}
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-mini">{option.description}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

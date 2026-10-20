import { useId } from "react";
import { cn } from "@/lib/utils";

export type RadioCardOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type Props<T extends string> = {
  value: T;
  /** NoInfer: ให้ T มาจาก value/options เท่านั้น ส่ง setState ตรง ๆ ได้ */
  onChange: (value: NoInfer<T>) => void;
  options: RadioCardOption<T>[];
  name?: string;
  className?: string;
};

/** radio แบบการ์ด ใช้ input radio จริงข้างใต้ จึงเลื่อนด้วยลูกศรได้เหมือน radio ปกติ */
export function RadioCardGroup<T extends string>({
  value,
  onChange,
  options,
  name,
  className,
}: Props<T>) {
  const fallbackName = useId();

  return (
    <div role="radiogroup" className={cn("flex flex-col gap-2", className)}>
      {options.map((option) => {
        const checked = option.value === value;

        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors",
              "has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
              checked ? "border-primary bg-primary/5" : "hover:bg-hover/50"
            )}
          >
            <input
              type="radio"
              name={name ?? fallbackName}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                checked ? "border-primary" : "border-slate-300 dark:border-border"
              )}
              aria-hidden
            >
              {checked && <span className="size-2 rounded-full bg-primary" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-normal">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs text-mini">{option.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

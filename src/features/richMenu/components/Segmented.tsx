import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** ตัวเลขท้ายป้าย เช่น จำนวนเมนูในแต่ละสถานะ */
  count?: number;
};

/** ตัวเลือกแบบแท็บเล็ก ๆ ใช้ทั้งตัวกรองรายการและปลายทางของการเผยแพร่ */
export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) => (
  <div
    className={cn("grid gap-1 rounded-lg bg-muted/60 p-1", className)}
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
    {options.map((option) => {
      const isActive = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={isActive}
          className={cn(
            "cursor-pointer truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            "outline-none focus-visible:ring-[2px] focus-visible:ring-ring/50",
            isActive
              ? "bg-background text-normal shadow-sm"
              : "text-mini hover:text-normal"
          )}
        >
          {option.label}
          {option.count === undefined ? null : (
            <span className="ml-1 text-[11px] opacity-60">{option.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

import { cn } from "@/lib/utils";

export type PillTab<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  tabs: PillTab<T>[];
  value: T;
  /** NoInfer: ให้ T มาจาก tabs/value เท่านั้น ส่ง setState ตรง ๆ ได้ */
  onChange: (value: NoInfer<T>) => void;
  className?: string;
};

/** ตัวกรองแบบเม็ดยา ตัวที่เลือกอยู่ใช้พื้นม่วงอ่อนกับตัวหนา */
export function PillTabs<T extends string>({ tabs, value, onChange, className }: Props<T>) {
  return (
    <div role="tablist" className={cn("flex flex-wrap items-center gap-2", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-5 py-2 text-sm transition-colors",
              "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "bg-button-primary/10 font-semibold text-button-primary"
                : "text-mini hover:bg-hover hover:text-normal"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

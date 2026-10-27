import { cn } from "@/lib/utils";

export type UnderlineTab<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  tabs: UnderlineTab<T>[];
  value: T;
  /** NoInfer: ให้ T มาจาก tabs/value เท่านั้น ส่ง setState ตรง ๆ ได้โดยไม่ทำให้ T กลายเป็น string */
  onChange: (value: NoInfer<T>) => void;
  className?: string;
};

/** แท็บแบบเส้นใต้ ใช้สลับมุมมองภายในหน้าเดียว (ไม่ได้เปลี่ยน route) */
export function UnderlineTabs<T extends string>({ tabs, value, onChange, className }: Props<T>) {
  return (
    <div role="tablist" className={cn("flex gap-6 overflow-x-auto border-b", className)}>
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
              "-mb-px cursor-pointer whitespace-nowrap border-b-2 pb-2 text-sm transition",
              isActive
                ? "border-button-primary font-medium text-button-primary"
                : "border-transparent text-mini hover:text-normal"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

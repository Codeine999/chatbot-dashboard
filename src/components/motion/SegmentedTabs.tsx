import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SegmentedTabOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type SegmentedTabsProps<T extends string> = {
  options: ReadonlyArray<SegmentedTabOption<T>>;
  value: T;
  onChange: (value: NoInfer<T>) => void;
  ariaLabel?: string;
  className?: string;
};

/**
 * แถบสลับแบบ segmented สไตล์ ElevenLabs พร้อม pill ที่เลื่อนตามด้วย layoutId
 * แยก scope layoutId ด้วย useId() เพื่อไม่ให้ชนกันเมื่อมีหลายชุดในหน้าเดียวกัน
 */
export const SegmentedTabs = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedTabsProps<T>) => {
  const layoutGroupId = useId();
  const prefersReduced = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative flex w-fit gap-0.5 rounded-[10px] bg-muted p-[3px]",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative h-8 cursor-pointer whitespace-nowrap rounded-lg px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "text-foreground"
                : "text-normal hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`segmented-pill-${layoutGroupId}`}
                transition={
                  prefersReduced ? { duration: 0 } : MOTION_SPRING.tab
                }
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-background shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]"
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

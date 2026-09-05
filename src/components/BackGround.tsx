import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type BackgroundProps = ComponentProps<"div">;

/** Parent needs `relative isolate` so this stays behind its content. */
export function Background({ className, ...props }: BackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
      {...props}
    >
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-15%,#ffffff_0%,#fbfaff_97%,#eef0ff_100%)] dark:bg-none dark:bg-[#1D1D1D] " 
      />
      <div 
        className="absolute -left-[16%] top-[27%] h-[45rem] w-[80rem] -rotate-[24deg] rounded-[100%]
        border border-white/70 bg-[linear-gradient(135deg,rgba(194,203,255,0.68),rgba(255,242,252,0.08)_46%,rgba(242,247,255,0.75))]
        opacity-20 dark:opacity-0 shadow-[0_0_54px_20px_rgba(255,255,255,0.9)]" 
      />
      <div 
        className="absolute -right-[20%] top-[44%] h-[36rem] w-[70rem] -rotate-[21deg] rounded-[100%] border 
        border-white/80 bg-[linear-gradient(135deg,rgba(239,225,255,0.16),rgba(255,255,255,0.92)_42%,rgba(192,226,255,0.62))] 
        opacity-0 shadow-[0_0_56px_16px_rgba(255,255,255,0.88)] dark:opacity-0" 
      />
      <div className="absolute left-[8%] top-[64%] h-32 w-[38rem] dark:opacity-0 -rotate-[27deg] rounded-full bg-white/70 blur-xl" />
      <div className="absolute right-[1%] top-[75%] h-24 w-[42rem] dark:opacity-0 -rotate-12 rounded-full bg-violet-200/35 blur-2xl" />
    </div>
  );
}

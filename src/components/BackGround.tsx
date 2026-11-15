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
      <div className="absolute inset-0 bg-background" />
    </div>
  );
}

import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center rounded-md border bg-muted px-1.5 font-sans text-[11px] font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }

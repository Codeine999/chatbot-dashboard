import * as React from "react"

import { cn } from "@/lib/utils"

/** toggle แบบไม่พึ่ง @radix-ui/react-switch (ยังไม่ได้ติดตั้งในโปรเจกต์)
 *  แต่คง API เดิมของ shadcn ไว้ เผื่อสลับไปใช้ radix ทีหลังได้เลย */
function Switch({
  className,
  checked = false,
  onCheckedChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      data-slot="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0 transition-colors",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export { Switch }

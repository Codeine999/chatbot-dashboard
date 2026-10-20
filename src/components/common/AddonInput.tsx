import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"input"> & {
  /** ข้อความ/ไอคอนในช่องหน้า input เช่น ฿ */
  addon: ReactNode;
  /** class ของกรอบนอก ส่วน className ใช้กับ input */
  wrapperClassName?: string;
};

/** input ที่มีช่องนำหน้าติดกัน ใช้กับช่องเงิน หน่วย หรือ prefix อื่น ๆ */
export const AddonInput = ({ addon, wrapperClassName, className, ...props }: Props) => (
  <div
    className={cn(
      "flex h-9 w-full min-w-0 items-stretch overflow-hidden rounded-md border border-input shadow-xs transition-[color,box-shadow] dark:bg-input/30",
      "focus-within:border-ring focus-within:ring-[1px] focus-within:ring-ring/50",
      "has-[input[aria-invalid=true]]:border-destructive has-[input:disabled]:opacity-50",
      wrapperClassName
    )}
  >
    <span className="flex shrink-0 items-center border-r bg-hover/60 px-3.5 text-sm text-mini">
      {addon}
    </span>
    <input
      className={cn(
        "min-w-0 flex-1 bg-transparent px-3.5 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
        className
      )}
      {...props}
    />
  </div>
);

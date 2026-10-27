import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * กรอบนอกสุดของทุกหน้า กำหนดระยะบนไว้ที่เดียว
 * หัวหน้าจะอยู่ตำแหน่ง X-Y เดิมเสมอเมื่อสลับหน้า ไม่ต้องไปตั้ง mt-* เองในแต่ละหน้า
 */
export const PageContainer = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("pt-4 pb-12", className)} {...props} />
);

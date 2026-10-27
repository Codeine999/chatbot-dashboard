import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CardDescription, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  subtitle?: string;
  /** ของที่อยู่หน้าชื่อหน้า เช่น ปุ่มย้อนกลับ (หน้าหลักไม่ต้องใส่ icon) */
  leading?: ReactNode;
  /** ปุ่มฝั่งขวาของหัวหน้า */
  actions?: ReactNode;
  className?: string;
};

/**
 * หัวหน้าของทุกหน้า ใช้ CardTitle/CardDescription ชุดเดียวกับหน้า Home
 * จึงได้ฟอนต์ ขนาด น้ำหนัก และสีเดียวกันทั้ง light และ dark
 */
export const PageHeader = ({ title, subtitle, leading, actions, className }: Props) => (
  <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
    <div className="flex min-w-0 items-center gap-3">
      {leading}
      <div className="min-w-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
        {subtitle && (
          <CardDescription className="mt-2 text-sm whitespace-normal">{subtitle}</CardDescription>
        )}
      </div>
    </div>

    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

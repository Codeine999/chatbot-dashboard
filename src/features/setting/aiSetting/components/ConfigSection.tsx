import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** ของฝั่งขวาของหัว section เช่น ตัวนับ skill */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** การ์ดหนึ่งหมวดของการปรับแต่ง AI: ไอคอน + หัวข้อ + คำอธิบาย แล้วตามด้วยเนื้อหา */
export const ConfigSection = ({ icon: Icon, title, subtitle, aside, children, className }: Props) => {
  const titleId = useId();

  return (
    <Card role="group" aria-labelledby={titleId} className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <Icon className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-normal">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-mini">{subtitle}</p>
          </div>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>

      <div className="mt-5">{children}</div>
    </Card>
  );
};

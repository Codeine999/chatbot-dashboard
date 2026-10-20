import { useId, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

/** การ์ดหนึ่งกลุ่มข้อมูลในฟอร์ม หัวข้อ + เนื้อหา */
export const SectionCard = ({ title, children, className }: Props) => {
  const titleId = useId();

  return (
    <Card role="group" aria-labelledby={titleId} className={cn("p-5", className)}>
      <h2 id={titleId} className="text-sm font-semibold text-normal">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
};

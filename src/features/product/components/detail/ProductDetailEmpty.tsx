import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** ช่องแผงรายละเอียดตอนยังไม่ได้เลือกสินค้า (แบบเดียวกับหน้าคลังความรู้ AI) */
export const ProductDetailEmpty = ({ className }: { className?: string }) => {
  const { t } = useTranslation("product");

  return (
    <Card className={cn("flex items-center justify-center p-10 text-center", className)}>
      <div>
        <Package className="mx-auto size-8 text-mini" />
        <p className="mt-3 text-sm text-normal">{t("detail.emptyTitle")}</p>
        <p className="mt-1 text-xs text-mini">{t("detail.emptyHint")}</p>
      </div>
    </Card>
  );
};

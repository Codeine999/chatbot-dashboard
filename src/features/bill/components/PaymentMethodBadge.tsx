import { QrCode, Receipt } from "lucide-react";
import type { PaymentMethod } from "../type";
import { useTranslation } from "react-i18next";

const paymentMethodConfig: Record<
  PaymentMethod,
  { labelKey: string; icon: typeof QrCode }
> = {
  slip: { labelKey: "paymentMethod.slip", icon: Receipt },
  qrcode: { labelKey: "paymentMethod.qrcode", icon: QrCode },
};

export const PaymentMethodBadge = ({ method }: { method: PaymentMethod }) => {
  const { t } = useTranslation("bill");
  const { labelKey, icon: Icon } = paymentMethodConfig[method];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
      <Icon className="size-4 text-gray-400" />
      {t(labelKey)}
    </span>
  );
};

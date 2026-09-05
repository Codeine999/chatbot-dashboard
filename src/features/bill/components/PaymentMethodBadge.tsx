import { QrCode, Receipt } from "lucide-react";
import type { PaymentMethod } from "../type";

const paymentMethodConfig: Record<
  PaymentMethod,
  { label: string; icon: typeof QrCode }
> = {
  slip: { label: "สลิปโอนเงิน", icon: Receipt },
  qrcode: { label: "QR Code", icon: QrCode },
};

export const PaymentMethodBadge = ({ method }: { method: PaymentMethod }) => {
  const { label, icon: Icon } = paymentMethodConfig[method];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
      <Icon className="size-4 text-gray-400" />
      {label}
    </span>
  );
};

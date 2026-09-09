import i18n from "@/i18n";
import { formatDate, formatTime } from "@/i18n/format";

import type {
  BillHistoryItem,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from "./type";

export { formatBaht, formatDate } from "@/i18n/format";

/** เช่น "6 ก.ย. 2569 เวลา 14:30" / "Sep 6, 2026 at 14:30" */
export const formatDateTime = (iso: string) =>
  `${formatDate(iso)} ${i18n.t("time.at")} ${formatTime(iso)}`;

export const mapBillHistoryStatus = (status: string): InvoiceStatus => {
  switch (status.toUpperCase()) {
    case "APPROVED":
    case "PAID":
    case "SUCCESS":
    case "COMPLETED":
      return "paid";
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
    case "CANCELED":
      return "failed";
    default:
      return "pending";
  }
};

const mapPaymentMethod = (type: string): PaymentMethod =>
  type.toLowerCase().replace(/_/g, "") === "qrcode" ? "qrcode" : "slip";

export const getBillHistoryDescription = (
  paymentMethod: PaymentMethod,
  status: InvoiceStatus
) => {
  // "QRcode"/"Slip" เป็นชื่อช่องทางชำระเงิน ใช้เหมือนกันทุกภาษา
  const method = paymentMethod === "qrcode" ? "QRcode" : "Slip";

  if (status === "pending") {
    return paymentMethod === "slip"
      ? i18n.t("bill:description.pendingSlip")
      : i18n.t("bill:description.pendingQrcode");
  }

  return status === "paid"
    ? i18n.t("bill:description.paid", { method })
    : i18n.t("bill:description.failed", { method });
};

const toNumber = (value: string) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const mapBillHistoryItem = (item: BillHistoryItem): Invoice => {
  const amount = toNumber(item.paidAmount);
  const status = mapBillHistoryStatus(item.status);
  const paymentMethod = mapPaymentMethod(item.type);

  return {
    id: item.id,
    description: getBillHistoryDescription(paymentMethod, status),
    date: item.createdAt,
    status,
    amount,
    paymentMethod,
    subtotal: amount,
    vat: 0,
    total: amount,
    amountPaid: amount,
    transactionId: item.id,
    paymentDate: item.approvedAt ?? item.rejectedAt ?? item.createdAt,
    creditAmount: toNumber(item.creditAmount),
    slipImage: item.slipImage,
    requestedBy: item.requestedBy,
  };
};

import type {
  BillHistoryItem,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from "./type";

export const formatBaht = (value: number) =>
  `฿${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formatDate(iso)} at ${time}`;
};

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
  const methodLabel = paymentMethod === "qrcode" ? "QRcode" : "Slip";

  if (status === "pending") {
    return paymentMethod === "slip"
      ? "รอตรวจสอบหลักฐานการชำระเงิน"
      : "รอดำเนินการชำระเงินด้วย QRcode";
  }

  return status === "paid"
    ? `ชำระเงินซื้อเครดิตด้วย ${methodLabel} สำเร็จ`
    : `ชำระเงินซื้อเครดิตด้วย ${methodLabel} ไม่สำเร็จ`;
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

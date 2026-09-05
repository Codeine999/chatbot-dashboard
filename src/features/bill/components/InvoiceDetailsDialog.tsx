import { Bot, Download, FileText, MessageCircle, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBaht, formatDateTime } from "../format";
import type { Invoice } from "../type";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { StatusBadge } from "./StatusBadge";

type Props = {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceDetailsDialog = ({ invoice, onOpenChange }: Props) => {
  const handleDownload = () => {
    toast.info("ตัวอย่างใบเสร็จ (mock) — ยังไม่มีไฟล์ PDF จริงให้ดาวน์โหลด");
  };

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        {invoice && (
          <>
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between">
              <StatusBadge status={invoice.status} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-gray-900">{invoice.id}</p>
                <p className="text-xs text-gray-400">{formatDateTime(invoice.paymentDate)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-primary font-semibold"
              >
                Download PDF
                <Download className="size-3.5" />
              </Button>
            </div>

            <div className="rounded-xl border p-4 space-y-2.5">
              <p className="text-sm font-semibold text-gray-700">Invoice Summary</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatBaht(invoice.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>VAT (7%)</span>
                <span>{formatBaht(invoice.vat)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-gray-800 pt-1 border-t">
                <span>Total</span>
                <span>{formatBaht(invoice.total)}</span>
              </div>
              {invoice.creditAmount !== undefined && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Credits</span>
                  <span>{invoice.creditAmount.toLocaleString()} credits</span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
                <span>Amount Paid</span>
                <span>{formatBaht(invoice.amountPaid)}</span>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-2.5">
              <p className="text-sm font-semibold text-gray-700">Payment Information</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Payment Method</span>
                <PaymentMethodBadge method={invoice.paymentMethod} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Transaction ID</span>
                <span className="max-w-[15rem] break-all text-right text-gray-700">
                  {invoice.transactionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Payment Date</span>
                <span className="text-gray-700">{formatDateTime(invoice.paymentDate)}</span>
              </div>
            </div>

            {invoice.usage && (
              <div className="rounded-xl border p-4 space-y-2.5">
                <p className="text-sm font-semibold text-gray-700">Usage Summary</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-3.5 text-gray-400" />
                    Chat Messages
                  </span>
                  <span className="text-gray-700">
                    {invoice.usage.chatMessages.toLocaleString()} messages
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Bot className="size-3.5 text-gray-400" />
                    AI Agents
                  </span>
                  <span className="text-gray-700">
                    {invoice.usage.aiAgentRuns.toLocaleString()} runs
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3.5 text-gray-400" />
                    Documents Processed
                  </span>
                  <span className="text-gray-700">
                    {invoice.usage.documentsProcessed.toLocaleString()} documents
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <WalletCards className="size-3.5 text-gray-400" />
                    Credits Used
                  </span>
                  <span className="text-gray-700">
                    {invoice.usage.creditsUsed.toLocaleString()} credits
                  </span>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-400">
              Need help?{" "}
              <button
                type="button"
                onClick={() => toast.info("ติดต่อฝ่ายสนับสนุน (mock)")}
                className="text-primary font-medium hover:underline cursor-pointer"
              >
                Contact Support
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

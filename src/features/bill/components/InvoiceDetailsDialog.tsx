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
import { useTranslation } from "react-i18next";

type Props = {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceDetailsDialog = ({ invoice, onOpenChange }: Props) => {
  const { t } = useTranslation("bill");

  const handleDownload = () => {
    toast.info(t("invoice.downloadMock"));
  };

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        {invoice && (
          <>
            <DialogHeader>
              <DialogTitle>{t("invoice.title")}</DialogTitle>
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
                {t("invoice.downloadPdf")}
                <Download className="size-3.5" />
              </Button>
            </div>

            <div className="rounded-xl border p-4 space-y-2.5">
              <p className="text-sm font-semibold text-gray-700">{t("invoice.summary")}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t("invoice.subtotal")}</span>
                <span>{formatBaht(invoice.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t("invoice.vat")}</span>
                <span>{formatBaht(invoice.vat)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-gray-800 pt-1 border-t">
                <span>{t("invoice.total")}</span>
                <span>{formatBaht(invoice.total)}</span>
              </div>
              {invoice.creditAmount !== undefined && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{t("invoice.credits")}</span>
                  <span>{t("invoice.creditsValue", { count: invoice.creditAmount })}</span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
                <span>{t("invoice.amountPaid")}</span>
                <span>{formatBaht(invoice.amountPaid)}</span>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-2.5">
              <p className="text-sm font-semibold text-gray-700">{t("invoice.paymentInfo")}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t("invoice.paymentMethod")}</span>
                <PaymentMethodBadge method={invoice.paymentMethod} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t("invoice.transactionId")}</span>
                <span className="max-w-[15rem] break-all text-right text-gray-700">
                  {invoice.transactionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{t("invoice.paymentDate")}</span>
                <span className="text-gray-700">{formatDateTime(invoice.paymentDate)}</span>
              </div>
            </div>

            {invoice.usage && (
              <div className="rounded-xl border p-4 space-y-2.5">
                <p className="text-sm font-semibold text-gray-700">{t("invoice.usageSummary")}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-3.5 text-gray-400" />
                    {t("invoice.chatMessages")}
                  </span>
                  <span className="text-gray-700">
                    {t("invoice.chatMessagesValue", { count: invoice.usage.chatMessages })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Bot className="size-3.5 text-gray-400" />
                    {t("invoice.aiAgents")}
                  </span>
                  <span className="text-gray-700">
                    {t("invoice.aiAgentsValue", { count: invoice.usage.aiAgentRuns })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3.5 text-gray-400" />
                    {t("invoice.documents")}
                  </span>
                  <span className="text-gray-700">
                    {t("invoice.documentsValue", { count: invoice.usage.documentsProcessed })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <WalletCards className="size-3.5 text-gray-400" />
                    {t("invoice.creditsUsed")}
                  </span>
                  <span className="text-gray-700">
                    {t("invoice.creditsValue", { count: invoice.usage.creditsUsed })}
                  </span>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-400">
              {t("invoice.needHelp")}{" "}
              <button
                type="button"
                onClick={() => toast.info(t("invoice.contactSupportMock"))}
                className="text-primary font-medium hover:underline cursor-pointer"
              >
                {t("invoice.contactSupport")}
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

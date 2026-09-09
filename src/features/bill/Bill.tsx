import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  TrendingUp,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { InvoiceDetailsDialog } from "./components/InvoiceDetailsDialog";
import { PaymentMethodBadge } from "./components/PaymentMethodBadge";
import { StatusBadge } from "./components/StatusBadge";
import { TopUpCreditsDialog } from "./components/TopUpCreditsDialog";
import { TopupSuccessDialog } from "./components/TopupSuccessDialog";
import { formatBaht, formatDate, getBillHistoryDescription } from "./format";
import { formatNumber } from "@/i18n/format";
import { useTranslation } from "react-i18next";
import { billingSummaryMock } from "./mock/bill.mock";
import { useBillHistory, useWallet } from "./hooks/useBill";
import type { BillHistoryFilter, Invoice } from "./type";

const filterTabs: { value: BillHistoryFilter; labelKey: string }[] = [
  { value: "all", labelKey: "filter.all" },
  { value: "paid", labelKey: "filter.paid" },
  { value: "pending", labelKey: "filter.pending" },
  { value: "failed", labelKey: "filter.failed" },
];

const formatCredits = (value: string | undefined, isLoading: boolean) => {
  if (isLoading) return "...";

  const credits = Number(value);
  return Number.isFinite(credits)
    ? formatNumber(credits, { maximumFractionDigits: 6 })
    : "—";
};

export const Bill = () => {
  const { t } = useTranslation("bill");
  const [filter, setFilter] = useState<BillHistoryFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [successCredits, setSuccessCredits] = useState<number | null>(null);
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useBillHistory({ page, status: filter });
  const invoices = history?.invoices ?? [];
  const pagination = history?.pagination;
  const firstItem = invoices.length
    ? ((pagination?.page ?? page) - 1) * (pagination?.limit ?? 8) + 1
    : 0;
  const lastItem = invoices.length ? firstItem + invoices.length - 1 : 0;

  const summaryCards = [
    {
      title: t("summary.currentBalance"),
      value: formatCredits(wallet?.balanceCredit, isWalletLoading),
      unit: t("common:unit.credit", { count: 2 }),
      accentValue: true,
      icon: Coins,
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsTopUpOpen(true)}
          className="mt-3 text-primary font-semibold"
        >
          {t("summary.topUp")}
        </Button>
      ),
    },
    {
      title: t("summary.totalSpent"),
      value: formatCredits(wallet?.lifetimeSpentCredit, isWalletLoading),
      unit: t("common:unit.credit", { count: 2 }),
      helper: t("summary.allTime"),
      icon: TrendingUp,
    },
    {
      title: t("summary.thisMonth"),
      value: formatBaht(billingSummaryMock.thisMonthSpent),
      helper: billingSummaryMock.thisMonthRangeLabel,
      icon: CalendarDays,
    },
    {
      title: t("summary.upcomingInvoice"),
      value: formatBaht(billingSummaryMock.upcomingInvoiceAmount),
      helper: billingSummaryMock.upcomingInvoiceDueLabel,
      icon: FileText,
    },
  ];

  return (
    <div className="mt-10 mb-12">
      <div>
        <h1 className="text-2xl font-semibold text-normal">{t("title")}</h1>
        <p className="mt-2 text-sm text-mini">{t("subtitle")}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-mini">{item.title}</p>
                  <p
                    className={cn(
                      "mt-3 text-2xl font-semibold",
                      item.accentValue
                        ? "text-primary"
                        : "text-normal"
                    )}
                  >
                    {item.value}
                    {item.unit && (
                      <span className="ml-1.5 text-sm font-medium text-mini">
                        {item.unit}
                      </span>
                    )}
                  </p>
                  {item.helper && <p className="mt-1 text-xs text-mini">{item.helper}</p>}
                  {item.action}
                </div>
                <div className="rounded-xl p-2.5 bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-normal">{t("history.title")}</h2>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              {t("history.export")}
            </Button>
          </div>

          <div className="mt-4 inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                  onClick={() => {
                    setFilter(tab.value);
                    setPage(1);
                  }}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  filter === tab.value
                    ? "bg-card text-primary shadow-sm"
                    : "text-mini hover:text-normal"
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div className="mt-2 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4">{t("table.invoice")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.amount")}</TableHead>
                  <TableHead>{t("table.paymentMethod")}</TableHead>
                  <TableHead className="px-4 text-right">{t("table.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isHistoryLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-mini">
                      {t("history.loading")}
                    </TableCell>
                  </TableRow>
                )}

                {isHistoryError && !isHistoryLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-destructive">{t("history.error")}</p>
                        <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                          {t("common:actions.retry")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isHistoryLoading && !isHistoryError && invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-mini">
                      {t("history.empty")}
                    </TableCell>
                  </TableRow>
                )}

                {!isHistoryLoading && !isHistoryError && invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="h-14">
                    <TableCell className="px-4 font-medium text-normal">
                      {getBillHistoryDescription(invoice.paymentMethod, invoice.status)}
                    </TableCell>
                    <TableCell className="text-mini">{formatDate(invoice.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-normal">{formatBaht(invoice.amount)}</TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={invoice.paymentMethod} />
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8">
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-mini">
              {t("history.showing", {
                from: firstItem,
                to: lastItem,
                total: pagination?.total ?? 0,
              })}
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={isHistoryLoading || !pagination?.hasPreviousPage}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    isActive
                    className="border-primary text-primary"
                  >
                    {pagination?.page ?? page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={isHistoryLoading || !pagination?.hasNextPage}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      />

      <TopUpCreditsDialog
        open={isTopUpOpen}
        onOpenChange={setIsTopUpOpen}
        onSuccess={setSuccessCredits}
      />

      <TopupSuccessDialog
        open={successCredits !== null}
        onOpenChange={(open) => !open && setSuccessCredits(null)}
        credits={successCredits ?? 0}
      />
    </div>
  );
};

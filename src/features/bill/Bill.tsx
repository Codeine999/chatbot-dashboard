import { useState } from "react";
import {
  CalendarDays,
  Coins,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
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
    ? formatNumber(credits, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
};

export const Bill = () => {
  const { t } = useTranslation("bill");
  const [filter, setFilter] = useState<BillHistoryFilter>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
      iconColor: "text-[#4f46e5]",
      action: (
        <button
          type="button"
          onClick={() => setIsTopUpOpen(true)}
          className="mt-1 flex h-[34px] cursor-pointer items-center gap-1.5 self-start rounded-full bg-[#4f46e5] pl-2.5 pr-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#4338ca]"
        >
          <Plus className="size-3.5" strokeWidth={2} />
          {t("summary.topUp")}
        </button>
      ),
    },
    {
      title: t("summary.totalSpent"),
      value: formatCredits(wallet?.lifetimeSpentCredit, isWalletLoading),
      unit: t("common:unit.credit", { count: 2 }),
      helper: t("summary.allTime"),
      icon: TrendingUp,
      iconColor: "text-[#2563eb]",
    },
    {
      title: t("summary.thisMonth"),
      value: formatBaht(billingSummaryMock.thisMonthSpent),
      helper: billingSummaryMock.thisMonthRangeLabel,
      icon: CalendarDays,
      iconColor: "text-[#ea580c]",
    },
    {
      title: t("summary.upcomingInvoice"),
      value: formatBaht(billingSummaryMock.upcomingInvoiceAmount),
      helper: billingSummaryMock.upcomingInvoiceDueLabel,
      icon: FileText,
      iconColor: "text-[#16a34a]",
    },
  ];

  const keyword = search.trim().toLowerCase();
  const visibleInvoices = keyword
    ? invoices.filter((invoice) =>
        getBillHistoryDescription(invoice.paymentMethod, invoice.status)
          .toLowerCase()
          .includes(keyword)
      )
    : invoices;

  const headCell = "border-b border-border/60 py-3.5 text-xs font-medium text-mini";
  const bodyCell = "border-t border-border/60 py-3.5";

  return (
    <PageContainer className="flex flex-col">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* สถิติ 4 ช่องคั่นด้วยเส้นตั้ง ไม่มีกรอบการ์ด */}
      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-y-7">
        {summaryCards.map((item, index) => (
          <div
            key={item.title}
            className={cn(
              "flex min-w-0 flex-col gap-2",
              index === 0 && "pr-6",
              index > 0 && "border-l border-border pl-6",
              index > 0 && index < summaryCards.length - 1 && "pr-6"
            )}
          >
            <span className="flex items-center gap-2 text-[13px] text-normal">
              <item.icon className={cn("size-4", item.iconColor)} strokeWidth={1.7} />
              {item.title}
            </span>
            <span className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] tabular-nums",
                  item.accentValue ? "text-[#4f46e5]" : "text-foreground"
                )}
              >
                {item.value}
              </span>
              {item.unit && <span className="text-[13px] text-mini">{item.unit}</span>}
            </span>
            {item.helper && <span className="text-[13px] text-mini">{item.helper}</span>}
            {item.action}
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-foreground">{t("history.heading")}</h2>
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-[10px] px-3 text-[13px] font-medium shadow-none"
        >
          <Download className="size-3.5" />
          {t("history.export")}
        </Button>
      </div>

      <div
        role="tablist"
        aria-label={t("history.heading")}
        className="mt-2.5 flex gap-6 overflow-x-auto border-b border-border"
      >
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 border-foreground text-sm font-medium text-foreground"
        >
          <span className="size-[7px] rounded-[2px] bg-[#4f46e5]" />
          {t("history.tabTopup")}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <div className="flex h-[38px] min-w-0 flex-[0_1_320px] items-center gap-2 border-b border-border px-3">
          <Search className="size-[15px] text-mini" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label={t("history.searchPlaceholder")}
            placeholder={t("history.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-mini"
          />
        </div>

        <div className="flex items-center gap-2.5 text-[13px]">
          <span className="text-mini">{t("history.statusLabel")}</span>
          <div
            role="radiogroup"
            aria-label={t("history.statusLabel")}
            className="flex gap-0.5 rounded-[10px] bg-muted p-[3px]"
          >
            {filterTabs.map((tab) => {
              const isActive = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => {
                    setFilter(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "h-[30px] cursor-pointer rounded-lg px-3 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]"
                      : "text-normal hover:text-foreground"
                  )}
                >
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th scope="col" className={cn(headCell, "pr-3 font-medium")}>
                {t("table.invoice")}
              </th>
              <th scope="col" className={cn(headCell, "px-3 font-medium")}>
                {t("table.date")}
              </th>
              <th scope="col" className={cn(headCell, "px-3 font-medium")}>
                {t("table.status")}
              </th>
              <th scope="col" className={cn(headCell, "px-3 text-right font-medium")}>
                {t("table.amount")}
              </th>
              <th scope="col" className={cn(headCell, "px-3 font-medium")}>
                {t("table.paymentMethod")}
              </th>
              <th scope="col" className={cn(headCell, "pl-3 text-right font-medium")}>
                <span className="sr-only">{t("table.action")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isHistoryLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="border-t border-border/60 py-11 text-center text-[13px] text-mini"
                >
                  {t("history.loading")}
                </td>
              </tr>
            )}

            {isHistoryError && !isHistoryLoading && (
              <tr>
                <td colSpan={6} className="border-t border-border/60 py-11 text-center">
                  <p className="text-sm text-destructive">{t("history.error")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => refetchHistory()}
                  >
                    {t("common:actions.retry")}
                  </Button>
                </td>
              </tr>
            )}

            {!isHistoryLoading && !isHistoryError && visibleInvoices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="border-t border-border/60 py-11 text-center text-[13px] text-mini"
                >
                  {t("history.empty")}
                </td>
              </tr>
            )}

            {!isHistoryLoading &&
              !isHistoryError &&
              visibleInvoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-muted/50">
                  <td className={cn(bodyCell, "pr-3 font-medium text-normal")}>
                    {getBillHistoryDescription(invoice.paymentMethod, invoice.status)}
                  </td>
                  <td className={cn(bodyCell, "whitespace-nowrap px-3 text-[13px] text-mini")}>
                    {formatDate(invoice.date)}
                  </td>
                  <td className={cn(bodyCell, "px-3")}>
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className={cn(bodyCell, "px-3 text-right tabular-nums text-normal")}>
                    {formatBaht(invoice.amount)}
                  </td>
                  <td className={cn(bodyCell, "px-3")}>
                    <PaymentMethodBadge method={invoice.paymentMethod} />
                  </td>
                  <td className={cn(bodyCell, "pl-3")}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-mini"
                        aria-label={t("invoice.title")}
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-mini"
                        aria-label={t("invoice.downloadPdf")}
                      >
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3.5 text-xs text-mini">
        <span>
          {t("history.showing", {
            from: firstItem,
            to: lastItem,
            total: pagination?.total ?? 0,
          })}
        </span>
        <span className="flex gap-4">
          <button
            type="button"
            disabled={isHistoryLoading || !pagination?.hasPreviousPage}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            className="cursor-pointer text-foreground disabled:cursor-not-allowed disabled:text-[#c4c4c4]"
          >
            {t("history.previous")}
          </button>
          <button
            type="button"
            disabled={isHistoryLoading || !pagination?.hasNextPage}
            onClick={() => setPage((currentPage) => currentPage + 1)}
            className="cursor-pointer text-foreground disabled:cursor-not-allowed disabled:text-[#c4c4c4]"
          >
            {t("history.next")}
          </button>
        </span>
      </div>

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
    </PageContainer>
  );
};

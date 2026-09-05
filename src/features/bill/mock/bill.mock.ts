import type { BillingSummary, CreditPackage, Invoice } from "../type";

export const creditPackagesMock: CreditPackage[] = [
  { id: "pkg-10k", credits: 10000, price: 299, pricePerCredit: 0.0299, popular: true },
  { id: "pkg-25k", credits: 25000, price: 699, pricePerCredit: 0.028 },
  { id: "pkg-50k", credits: 50000, price: 1299, pricePerCredit: 0.026 },
];

export const billingSummaryMock: BillingSummary = {
  currentBalanceCredits: 125430,
  totalSpentAllTime: 24560,
  thisMonthSpent: 3240,
  thisMonthRangeLabel: "May 1 - May 31, 2026",
  upcomingInvoiceAmount: 1560,
  upcomingInvoiceDueLabel: "Due on Jun 1, 2026",
};

const deriveBreakdown = (total: number) => {
  const subtotal = Math.round((total / 1.07) * 100) / 100;
  const vat = Math.round((total - subtotal) * 100) / 100;
  return { subtotal, vat };
};

export const invoicesMock: Invoice[] = [
  {
    id: "INV-2026-0528-0012",
    date: "2026-05-28",
    status: "paid",
    amount: 1560,
    paymentMethod: "qrcode",
    subtotal: 1420,
    vat: 99.4,
    total: 1560,
    amountPaid: 1560,
    transactionId: "TXN-20260528-143256",
    paymentDate: "2026-05-28T14:32:00",
    usage: {
      chatMessages: 12340,
      aiAgentRuns: 2450,
      documentsProcessed: 340,
      creditsUsed: 31200,
    },
  },
  {
    id: "INV-2026-0515-0009",
    date: "2026-05-15",
    status: "paid",
    amount: 2490,
    paymentMethod: "slip",
    ...deriveBreakdown(2490),
    total: 2490,
    amountPaid: 2490,
    transactionId: "TXN-20260515-091204",
    paymentDate: "2026-05-15T09:12:00",
    usage: {
      chatMessages: 9870,
      aiAgentRuns: 1980,
      documentsProcessed: 265,
      creditsUsed: 24900,
    },
  },
  {
    id: "INV-2026-0430-0007",
    date: "2026-04-30",
    status: "paid",
    amount: 3120,
    paymentMethod: "qrcode",
    ...deriveBreakdown(3120),
    total: 3120,
    amountPaid: 3120,
    transactionId: "TXN-20260430-163011",
    paymentDate: "2026-04-30T16:30:00",
    usage: {
      chatMessages: 15230,
      aiAgentRuns: 3010,
      documentsProcessed: 412,
      creditsUsed: 31200,
    },
  },
  {
    id: "INV-2026-0401-0004",
    date: "2026-04-01",
    status: "paid",
    amount: 2980,
    paymentMethod: "slip",
    ...deriveBreakdown(2980),
    total: 2980,
    amountPaid: 2980,
    transactionId: "TXN-20260401-104518",
    paymentDate: "2026-04-01T10:45:00",
    usage: {
      chatMessages: 14020,
      aiAgentRuns: 2780,
      documentsProcessed: 388,
      creditsUsed: 29800,
    },
  },
  {
    id: "INV-2026-0301-0002",
    date: "2026-03-01",
    status: "paid",
    amount: 2450,
    paymentMethod: "qrcode",
    ...deriveBreakdown(2450),
    total: 2450,
    amountPaid: 2450,
    transactionId: "TXN-20260301-081940",
    paymentDate: "2026-03-01T08:19:00",
    usage: {
      chatMessages: 9640,
      aiAgentRuns: 1920,
      documentsProcessed: 251,
      creditsUsed: 24500,
    },
  },
  {
    id: "INV-2026-0201-0001",
    date: "2026-02-01",
    status: "paid",
    amount: 2890,
    paymentMethod: "slip",
    ...deriveBreakdown(2890),
    total: 2890,
    amountPaid: 2890,
    transactionId: "TXN-20260201-133702",
    paymentDate: "2026-02-01T13:37:00",
    usage: {
      chatMessages: 13580,
      aiAgentRuns: 2690,
      documentsProcessed: 376,
      creditsUsed: 28900,
    },
  },
];

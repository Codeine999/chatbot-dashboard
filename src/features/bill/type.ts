export type InvoiceStatus = "paid" | "pending" | "failed";

export type PaymentMethod = "slip" | "qrcode";

export type UsageSummary = {
  chatMessages: number;
  aiAgentRuns: number;
  documentsProcessed: number;
  creditsUsed: number;
};

export type Invoice = {
  id: string;
  description?: string;
  date: string;
  status: InvoiceStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  vat: number;
  total: number;
  amountPaid: number;
  transactionId: string;
  paymentDate: string;
  usage?: UsageSummary;
  creditAmount?: number;
  slipImage?: string | null;
  requestedBy?: BillHistoryUser | null;
};

export type BillHistoryUser = {
  id: string;
  username: string;
};

export type BillHistoryFilter = InvoiceStatus | "all";

export type BillHistoryQuery = {
  page: number;
  status: BillHistoryFilter;
};

export type BillHistoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

/** Raw response item from GET /admin/bill/history. */
export type BillHistoryItem = {
  id: string;
  companyId: string;
  type: string;
  exchangeRateId: string | null;
  packagePriceId: string | null;
  paidAmount: string;
  creditAmount: string;
  slipImage: string | null;
  status: string;
  requestedById: string;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedById: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy: BillHistoryUser | null;
  approvedBy: BillHistoryUser | null;
  rejectedBy: BillHistoryUser | null;
};

export type BillHistoryResponse = {
  items: BillHistoryItem[];
  pagination: BillHistoryPagination;
};

export type CreditSelection =
  | { packageId: string; paidAmount?: never }
  | { packageId?: never; paidAmount: string };

export type CreditQuote = {
  source: "package" | "custom";
  packageId: string | null;
  packageName: string | null;
  paidAmount: string;
  creditsPerThb: string;
  creditAmount: string;
  pricePerCredit: string;
  popular: boolean;
  sortOrder: number | null;
};

export type CreditPackagesResponse = {
  creditsPerThb: string;
  packages: CreditQuote[];
};

/** ค่าที่ backend รับใน field `type` ของ /admin/bill/top-up */
export type TopupType = "Slip" | "QRcode";

export type CreateTopupPayload = CreditSelection & {
  type: TopupType;
  slip: File;
};

export type CreateTopupResponse = {
  id: string;
  creditAmount: string;
  paidAmount: string;
  status: string;
};

/** Raw response from GET /admin/wallet/mine. Decimal fields are serialized as strings. */
export type Wallet = {
  id: string;
  companyId: string;
  balanceCredit: string;
  reservedCredit: string;
  lifetimeTopupCredit: string;
  lifetimeSpentCredit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  /** ราคาต่อเครดิต ใช้โชว์ให้เทียบความคุ้มระหว่างแพ็กเกจ */
  pricePerCredit: number;
  popular?: boolean;
};

export type BillingSummary = {
  currentBalanceCredits: number;
  totalSpentAllTime: number;
  thisMonthSpent: number;
  thisMonthRangeLabel: string;
  upcomingInvoiceAmount: number;
  upcomingInvoiceDueLabel: string;
};

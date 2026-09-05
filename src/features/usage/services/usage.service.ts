import { api } from "@/api/api";

export type CreditUsageItem = {
  type: string;
  usedTotal: number;
  balance: number;
};

type CreditsResponse =
  | CreditUsageItem[]
  | {
      data?: CreditUsageItem[] | { credits?: CreditUsageItem[] };
      credits?: CreditUsageItem[];
      result?: CreditUsageItem[];
    };

export type AdminUsageResponse = {
  companyCredit: {
    balanceCredit: string | number | null;
    usedCredit: string | number | null;
  };
  adminCredit: {
    admin: {
      walletId: string;
      limitCredit: string | number | null;
      usedCredit: string | number | null;
    } | null;
  };
};

export type AdminUsage = {
  company: { balance: number; used: number };
  admin: { walletId: string | null; limit: number | null; used: number };
};

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNullableNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export type UsageAccountResponse = {
  id?: string | null;
  walletId?: string | null;
  username?: string | null;
  role?: string | null;
  status?: string | null;
  usedCredit?: string | number | null;
  limitCredit?: string | number | null;
  /** optional chat-credit fields, row is hidden when the API does not send them */
  chatUsedCredit?: string | number | null;
  chatLimitCredit?: string | number | null;
};

type UsageAccountsPayload =
  | UsageAccountResponse
  | UsageAccountResponse[]
  | {
      data?: UsageAccountResponse | UsageAccountResponse[];
      accounts?: UsageAccountResponse[];
      result?: UsageAccountResponse[];
    };

export type UsageAccountItem = {
  id: string;
  username: string;
  role: string;
  status: "active" | "trial" | "inactive";
  aiUsed: number;
  aiLimit: number | null;
  chatUsed: number | null;
  chatLimit: number | null;
};

const toStatus = (value: string | null | undefined): UsageAccountItem["status"] => {
  const status = value?.toLowerCase();
  if (status === "trial" || status === "inactive") return status;
  return "active";
};

const toUsageAccount = (item: UsageAccountResponse, index: number): UsageAccountItem => ({
  id: item.id ?? item.walletId ?? item.username ?? `account-${index}`,
  username: item.username ?? "Account",
  role: item.role ?? "",
  status: toStatus(item.status),
  aiUsed: toNumber(item.usedCredit),
  aiLimit: toNullableNumber(item.limitCredit),
  chatUsed: toNullableNumber(item.chatUsedCredit),
  chatLimit: toNullableNumber(item.chatLimitCredit),
});

const isAccountLike = (value: unknown): value is UsageAccountResponse =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  ["username", "usedCredit", "limitCredit", "role", "walletId"].some(
    (key) => key in (value as Record<string, unknown>)
  );

/** the endpoint may return one account, an array, or any of the usual wrappers */
const unwrapAccounts = (payload: unknown, depth = 0): UsageAccountResponse[] => {
  if (!payload || depth > 3) return [];
  if (Array.isArray(payload)) return payload.filter(isAccountLike);
  if (isAccountLike(payload)) return [payload];

  if (typeof payload === "object") {
    for (const value of Object.values(payload as Record<string, unknown>)) {
      const found = unwrapAccounts(value, depth + 1);
      if (found.length) return found;
    }
  }

  return [];
};

export type LinePushMessageResponse = {
  /** LINE quota shape: { type: "limited", value: 1000 } */
  type?: string | null;
  value?: string | number | null;
  limit?: string | number | null;
  totalUsage?: string | number | null;
  used?: string | number | null;
  usedCredit?: string | number | null;
};

export type LinePushMessageUsage = {
  used: number;
  limit: number;
};

export const usageApi = {
  getLineOaCredits: async (): Promise<CreditUsageItem[]> => {
    const res = await api.post<CreditsResponse>("/credits/line-oa");
    const payload = res.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data?.credits)) return payload.data.credits;
    if (Array.isArray(payload.credits)) return payload.credits;
    if (Array.isArray(payload.result)) return payload.result;

    return [];
  },
  getAdminUsage: async (): Promise<AdminUsage> => {
    const res = await api.get<AdminUsageResponse>("/admin/usage");
    const { companyCredit, adminCredit } = res.data;

    return {
      company: {
        balance: toNumber(companyCredit?.balanceCredit),
        used: toNumber(companyCredit?.usedCredit),
      },
      admin: {
        walletId: adminCredit?.admin?.walletId ?? null,
        limit: toNullableNumber(adminCredit?.admin?.limitCredit),
        used: toNumber(adminCredit?.admin?.usedCredit),
      },
    };
  },
  getUsageAccounts: async (): Promise<UsageAccountItem[]> => {
    const res = await api.get<UsageAccountsPayload>("/admin/usage/account");

    if (import.meta.env.DEV) console.log("[usage] /admin/usage/account", res.data);

    return unwrapAccounts(res.data).map(toUsageAccount);
  },
  getLinePushMessageUsage: async (): Promise<LinePushMessageUsage> => {
    const res = await api.get<LinePushMessageResponse>("/admin/usage/line/push-message");
    const payload = res.data ?? {};

    if (import.meta.env.DEV) {
      console.log("[usage] /admin/usage/line/push-message", payload);
    }

    return {
      used: toNumber(payload.totalUsage ?? payload.used ?? payload.usedCredit),
      limit: toNumber(payload.value ?? payload.limit),
    };
  },
};

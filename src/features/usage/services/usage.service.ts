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
};

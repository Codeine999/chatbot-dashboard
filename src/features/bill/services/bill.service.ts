import { api } from "@/api/api";
import type {
  CreateTopupPayload,
  CreateTopupResponse,
  BillHistoryQuery,
  BillHistoryResponse,
  CreditPackagesResponse,
  CreditQuote,
  CreditSelection,
  Wallet,
} from "../type";

export const billApi = {
  getWallet: async (): Promise<Wallet> => {
    const response = await api.get<Wallet>("/admin/wallet/mine");
    return response.data;
  },

  getHistory: async (
    query: BillHistoryQuery
  ): Promise<BillHistoryResponse> => {
    const response = await api.get<BillHistoryResponse>("/admin/bill/history", {
      params: {
        page: query.page,
        ...(query.status === "all" ? {} : { status: query.status }),
      },
    });
    return response.data;
  },

  getPackages: async (): Promise<CreditPackagesResponse> => {
    const response = await api.get<CreditPackagesResponse>(
      "/admin/bill/packages"
    );
    return response.data;
  },

  calculateCredit: async (selection: CreditSelection): Promise<CreditQuote> => {
    const response = await api.post<CreditQuote>(
      "/admin/bill/calculate-credit",
      selection
    );
    return response.data;
  },

  createTopup: async (
    payload: CreateTopupPayload
  ): Promise<CreateTopupResponse> => {
    const formData = new FormData();
    formData.append("type", payload.type);
    if (payload.packageId) formData.append("packageId", payload.packageId);
    if (payload.paidAmount) formData.append("paidAmount", payload.paidAmount);
    formData.append("slip", payload.slip);

    const response = await api.post<CreateTopupResponse>(
      "/admin/bill/top-up",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },
};

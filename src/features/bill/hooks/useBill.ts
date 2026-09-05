import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import { billApi } from "../services/bill.service";
import { mapBillHistoryItem } from "../format";
import type { BillHistoryQuery, CreateTopupResponse } from "../type";

export const billKeys = {
  all: ["bill"] as const,
  wallet: () => [...billKeys.all, "wallet"] as const,
  history: (query: BillHistoryQuery) =>
    [...billKeys.all, "history", query] as const,
  packages: () => [...billKeys.all, "packages"] as const,
  calculation: (paidAmount: string) =>
    [...billKeys.all, "calculation", paidAmount] as const,
  topup: () => [...billKeys.all, "topup"] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: billKeys.wallet(),
    queryFn: billApi.getWallet,
    staleTime: 30 * 1000,
  });
}

export function useBillHistory(query: BillHistoryQuery) {
  return useQuery({
    queryKey: billKeys.history(query),
    queryFn: () => billApi.getHistory(query),
    select: (history) => ({
      invoices: history.items.map(mapBillHistoryItem),
      pagination: history.pagination,
    }),
    staleTime: 30 * 1000,
  });
}

export function useCreditPackages(enabled = true) {
  return useQuery({
    queryKey: billKeys.packages(),
    queryFn: billApi.getPackages,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCalculateCredit(paidAmount: string, enabled = true) {
  return useQuery({
    queryKey: billKeys.calculation(paidAmount),
    queryFn: () => billApi.calculateCredit({ paidAmount }),
    enabled: enabled && paidAmount.length > 0,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useCreateTopup(
  onSuccess: (topup: CreateTopupResponse) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: billKeys.topup(),
    mutationFn: billApi.createTopup,
    onSuccess: (topup) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      onSuccess(topup);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "เติมเครดิตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"));
    },
  });
}

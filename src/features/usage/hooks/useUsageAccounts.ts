import { useQuery } from "@tanstack/react-query";
import { usageApi } from "../services/usage.service";

export function useUsageAccounts() {
  return useQuery({
    queryKey: ["admin", "usage", "account"],
    queryFn: usageApi.getUsageAccounts,
  });
}

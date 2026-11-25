import { useQuery } from "@tanstack/react-query";
import { usageApi } from "../services/usage.service";

export function useAdminUsage(enabled = true) {
  return useQuery({
    queryKey: ["admin", "usage"],
    queryFn: usageApi.getAdminUsage,
    enabled,
  });
}

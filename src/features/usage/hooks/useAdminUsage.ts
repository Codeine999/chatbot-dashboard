import { useQuery } from "@tanstack/react-query";
import { usageApi } from "../services/usage.service";

export function useAdminUsage() {
  return useQuery({
    queryKey: ["admin", "usage"],
    queryFn: usageApi.getAdminUsage,
  });
}

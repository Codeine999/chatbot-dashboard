import { useQuery } from "@tanstack/react-query";
import { usageApi } from "../services/usage.service";

export function useLinePushMessageUsage() {
  return useQuery({
    queryKey: ["admin", "usage", "line", "push-message"],
    queryFn: usageApi.getLinePushMessageUsage,
  });
}

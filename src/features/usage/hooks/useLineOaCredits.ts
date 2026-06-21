import { useQuery } from "@tanstack/react-query";
import { usageApi } from "../services/usage.service";

export function useLineOaCredits() {
  return useQuery({
    queryKey: ["credits", "line-oa"],
    queryFn: usageApi.getLineOaCredits,
  });
}

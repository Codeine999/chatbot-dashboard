import { useQuery } from "@tanstack/react-query";
import { lineOaApi } from "../services/lineOa.service";

export function useLineOaInfo() {
  return useQuery({
    queryKey: ["line-oa", "info"],
    queryFn: lineOaApi.getInfo,
  });
}

export function useLineOaFollowers() {
  return useQuery({
    queryKey: ["line-oa", "followers"],
    queryFn: lineOaApi.getFollowers,
  });
}

export function useLineOaMessageUsage() {
  return useQuery({
    queryKey: ["line-oa", "message-usage"],
    queryFn: lineOaApi.getMessageUsage,
  });
}

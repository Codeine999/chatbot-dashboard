import { useQuery } from "@tanstack/react-query";
import { adminListApi } from "../services/adminList.service";

export const adminListKeys = {
  all: ["admin-list"] as const,
  list: () => [...adminListKeys.all, "list"] as const,
};

export function useAdminList() {
  return useQuery({
    queryKey: adminListKeys.list(),
    queryFn: adminListApi.getAll,
    staleTime: 60 * 1000,
  });
}

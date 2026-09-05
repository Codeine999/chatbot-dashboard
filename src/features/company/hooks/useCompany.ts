import { useQuery } from "@tanstack/react-query";
import { companyApi } from "../services/company.service";

export const companyKeys = {
  all: ["company"] as const,
  brandInfo: () => [...companyKeys.all, "brand-info"] as const,
};

export function useCompanyBrandInfo() {
  return useQuery({
    queryKey: companyKeys.brandInfo(),
    queryFn: companyApi.getBrandInfo,
  });
}

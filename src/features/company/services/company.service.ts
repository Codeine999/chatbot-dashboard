import { api } from "@/api/api";
import type { CompanyBrandInfo } from "../type";

export const companyApi = {
  getBrandInfo: async (): Promise<CompanyBrandInfo> => {
    const res = await api.get<CompanyBrandInfo>("/admin/company/brand-info");
    return res.data;
  },
};

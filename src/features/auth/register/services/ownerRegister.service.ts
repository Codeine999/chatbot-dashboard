import { api } from "@/api/api";
import type {
  AuditOwnerPayload,
  AuditOwnerResponse,
  CreateCompanyPayload,
  CreateOwnerPayload,
  CreateOwnerResponse,
} from "../type";

export const ownerRegisterApi = {
  auditOwner: async (
    payload: AuditOwnerPayload
  ): Promise<AuditOwnerResponse> => {
    const res = await api.post<AuditOwnerResponse>(
      "/admin/auth/audit-owner",
      payload
    );
    return res.data;
  },

  createOwner: async (
    payload: CreateOwnerPayload
  ): Promise<CreateOwnerResponse> => {
    const res = await api.post<CreateOwnerResponse>("/admin/auth/owner", payload);
    return res.data;
  },

  createCompany: async (payload: CreateCompanyPayload): Promise<void> => {
    const formData = new FormData();
    formData.append("companyName", payload.companyName);
    formData.append("companyType", payload.companyType);
    if (payload.image) formData.append("image", payload.image);

    // ต้อง override ทับ default "application/json" ของ api instance ไม่งั้น axios
    // จะเห็น content-type เป็น json แล้ว JSON.stringify FormData ทิ้งไฟล์หายหมด
    await api.post("/admin/company/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

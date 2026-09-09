import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import i18n from "@/i18n";
import { authApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { clearOwnerRegisterDraft } from "../ownerRegister.draft";
import { ownerRegisterApi } from "../services/ownerRegister.service";
import type { OwnerRegisterForm } from "../type";

export const ownerRegisterKeys = {
  all: ["owner-register"] as const,
  complete: () => [...ownerRegisterKeys.all, "complete"] as const,
};

export function useCompleteOwnerRegistration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationKey: ownerRegisterKeys.complete(),
    mutationFn: async (data: OwnerRegisterForm) => {
      await ownerRegisterApi.createOwner({
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        image: data.avatar || null,
        role: "owner",
      });

      const loginResult = await authApi.login({
        username: data.username,
        password: data.password,
      });
      setAuth(loginResult);

      await ownerRegisterApi.createCompany({
        companyName: data.companyName,
        companyType: data.companyType,
        image: data.companyImage,
      });
    },
    onSuccess: () => {
      clearOwnerRegisterDraft();
      queryClient.clear();
      toast.success(i18n.t("toast.registerSuccess"));
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import { adminListApi } from "../services/adminList.service";
import { adminListKeys } from "./useAdminList";

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminListApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminListKeys.all });
      toast.success(i18n.t("admins:toast.created"));
    },
    onError: (error) => toast.error(getApiErrorMessage(error, i18n.t("admins:toast.createFailed"))),
  });
}

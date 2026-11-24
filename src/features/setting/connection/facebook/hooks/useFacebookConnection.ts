import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import i18n from "@/i18n";
import type { ConnectionStatus } from "../../type";
import { isForbiddenError } from "../../utils/connectionErrors";
import {
  emptyFacebookCredentials,
  facebookCredentialsSchema,
  type FacebookCredentialsForm,
} from "../schema/facebookCredentials.schema";
import { getFacebookConnectErrorMessage } from "../utils/facebookErrors";
import {
  useConnectFacebookChannel,
  useDisconnectFacebookChannel,
  useFacebookChannelStatus,
} from "./useFacebookChannel";

export const useFacebookConnection = () => {
  const channel = useFacebookChannelStatus();
  const connect = useConnectFacebookChannel();
  const disconnect = useDisconnectFacebookChannel();
  const [editing, setEditing] = useState(false);

  const form = useForm<FacebookCredentialsForm>({
    resolver: zodResolver(facebookCredentialsSchema),
    mode: "onChange",
    defaultValues: emptyFacebookCredentials,
  });

  const state = channel.data;
  // ค่าที่เก็บในระบบแล้วจะไม่ถูกส่งกลับมา ต้องกดแก้ไขแล้วกรอกใหม่
  const locked = state?.source === "db" && !editing;

  const status: ConnectionStatus = connect.isPending
    ? "testing"
    : connect.isError
      ? "failed"
      : state?.connected
        ? "connected"
        : "idle";

  const leaveEditing = () => {
    form.reset(emptyFacebookCredentials);
    setEditing(false);
  };

  const submit = form.handleSubmit((values) => {
    connect.mutate(
      { appSecret: values.appSecret, pageAccessToken: values.pageAccessToken },
      {
        onSuccess: (result) => {
          // ล้างค่าลับออกจากฟอร์มทันทีที่บันทึกสำเร็จ
          leaveEditing();
          if (result.subscription && !result.subscription.ok)
            toast.warning(i18n.t("settings:connection.facebook.toast.subscribeManual"));
        },
      }
    );
  });

  const startEdit = () => {
    connect.reset();
    form.reset(emptyFacebookCredentials);
    setEditing(true);
  };

  const cancelEdit = () => {
    connect.reset();
    leaveEditing();
  };

  const reset = () => {
    connect.reset();
    form.reset(emptyFacebookCredentials);
  };

  const remove = () =>
    disconnect.mutate(undefined, {
      onSuccess: () => {
        connect.reset();
        leaveEditing();
        toast.success(i18n.t("settings:connection.facebook.toast.disconnected"));
      },
      onError: (error) => toast.error(getFacebookConnectErrorMessage(error)),
    });

  return {
    form,
    state,
    status,
    isLoading: channel.isLoading,
    isForbidden: isForbiddenError(channel.error),
    locked,
    canCancel: editing,
    canSubmit: form.formState.isValid && !connect.isPending,
    isSaving: connect.isPending,
    isDisconnecting: disconnect.isPending,
    justConnected: connect.isSuccess,
    errorMessage: connect.isError
      ? getFacebookConnectErrorMessage(connect.error)
      : null,
    // ตั้ง subscription อัตโนมัติไม่สำเร็จในรอบที่เพิ่งบันทึก ให้ไป subscribe ใน Meta dashboard เอง
    subscribeNeedsManual: connect.data?.subscription?.ok === false,
    submit,
    startEdit,
    cancelEdit,
    reset,
    remove,
  };
};

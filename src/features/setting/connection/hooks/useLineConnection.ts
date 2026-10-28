import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import i18n from "@/i18n";
import {
  emptyCredentials,
  lineCredentialsSchema,
  type LineCredentialsForm,
} from "../schema/lineCredentials.schema";
import type { ConnectionStatus } from "../type";
import {
  getConnectErrorMessage,
  isForbiddenError,
} from "../utils/connectionErrors";
import { resolveWebhookUrl } from "../utils/connectionView";
import { useConnectLineChannel, useLineChannelStatus } from "./useLineChannel";
import { useWebhookHealth } from "./useLineWebhook";

export const useLineConnection = () => {
  const channel = useLineChannelStatus();
  const connect = useConnectLineChannel();
  const webhookHealth = useWebhookHealth(Boolean(channel.data?.connected));
  const [editing, setEditing] = useState(false);

  const form = useForm<LineCredentialsForm>({
    resolver: zodResolver(lineCredentialsSchema),
    // validate ทุกครั้งที่พิมพ์ ปุ่มบันทึกจึงเปิดทันทีที่ทุกช่องถูกต้อง
    mode: "onChange",
    defaultValues: emptyCredentials,
  });

  const state = channel.data;
  // ค่าที่เก็บในระบบแล้วจะไม่ถูกส่งกลับมาให้แก้ตรง ๆ ต้องกดแก้ไขแล้วกรอกใหม่
  const locked = state?.source === "db" && !editing;

  const status: ConnectionStatus = connect.isPending
    ? "testing"
    : connect.isError
      ? "failed"
      : state?.connected
        ? "connected"
        : "idle";

  const leaveEditing = () => {
    form.reset(emptyCredentials);
    setEditing(false);
  };

  const submit = form.handleSubmit((values) => {
    connect.mutate(
      {
        channelId: values.channelId,
        channelSecret: values.channelSecret,
        accessToken: values.channelAccessToken,
      },
      {
        onSuccess: (result) => {
          // ล้างค่าลับออกจากฟอร์มทันทีที่บันทึกสำเร็จ
          leaveEditing();
          if (result.webhook && !result.webhook.ok)
            toast.warning(i18n.t("settings:connection.toast.webhookManual"));
        },
      }
    );
  });

  const startEdit = () => {
    connect.reset();
    form.reset(emptyCredentials);
    setEditing(true);
  };

  const cancelEdit = () => {
    connect.reset();
    leaveEditing();
  };

  const reset = () => {
    connect.reset();
    form.reset(emptyCredentials);
  };

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
    justConnected: connect.isSuccess,
    errorMessage: connect.isError ? getConnectErrorMessage(connect.error) : null,
    webhookUrl: resolveWebhookUrl(state),
    // ถามจาก LINE ตรง ๆ ได้ก็ใช้ค่านั้น ถ้าถามไม่ได้ค่อยใช้ผลทดสอบที่ backend จำไว้
    webhookReady: webhookHealth.data
      ? webhookHealth.data.configured.state === "ok"
      : Boolean(state?.webhookSetAt),
    // ตั้ง webhook อัตโนมัติไม่สำเร็จในรอบที่เพิ่งบันทึก ให้เจ้าของร้านวาง URL เอง
    webhookNeedsManual: connect.data?.webhook?.ok === false,
    submit,
    startEdit,
    cancelEdit,
    reset,
  };
};

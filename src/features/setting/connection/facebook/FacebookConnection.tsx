import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LockKeyhole } from "lucide-react";
import { FacebookCredentialsCard } from "./components/FacebookCredentialsCard";
import { FacebookStatusCard } from "./components/FacebookStatusCard";
import { FacebookWebhookCard } from "./components/FacebookWebhookCard";
import { useFacebookConnection } from "./hooks/useFacebookConnection";

export const FacebookConnection = () => {
  const { t } = useTranslation("settings");
  const connection = useFacebookConnection();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (connection.isForbidden)
    return (
      <div className="mt-6">
        <EmptyState
          icon={LockKeyhole}
          title={t("connection.facebook.noAccess.title")}
          description={t("connection.facebook.noAccess.description")}
        />
      </div>
    );

  const { state } = connection;
  const subscribed = Boolean(state?.webhookSetAt) || state?.source === "env";

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col">
        <FacebookWebhookCard
          url={state?.webhookUrl ?? null}
          verifyToken={state?.verifyToken ?? null}
          ready={subscribed && Boolean(state?.connected)}
          needsManual={connection.subscribeNeedsManual}
        />
        <FacebookCredentialsCard
          form={connection.form}
          state={state}
          locked={connection.locked}
          canCancel={connection.canCancel}
          canSubmit={connection.canSubmit}
          isSaving={connection.isSaving}
          isDisconnecting={connection.isDisconnecting}
          onSubmit={connection.submit}
          onEdit={connection.startEdit}
          onCancel={connection.cancelEdit}
          onReset={connection.reset}
          onDisconnect={() => setConfirmOpen(true)}
        />
      </div>

      <FacebookStatusCard
        status={connection.status}
        loading={connection.isLoading}
        state={state}
        celebrate={connection.justConnected}
        errorMessage={connection.errorMessage}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("connection.facebook.disconnectDialog.title")}
        description={t("connection.facebook.disconnectDialog.description")}
        confirmLabel={t("connection.facebook.disconnect")}
        destructive
        isPending={connection.isDisconnecting}
        onConfirm={() => {
          connection.remove();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
};

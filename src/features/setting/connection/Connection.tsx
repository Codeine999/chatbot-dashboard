import { useTranslation } from "react-i18next";
import { useLineConnection } from "./hooks/useLineConnection";
import { WebhookCard } from "./components/WebhookCard";
import { LineCredentialsCard } from "./components/LineCredentialsCard";
import { ConnectionStatusCard } from "./components/ConnectionStatusCard";
import { OwnerOnlyNotice } from "./components/OwnerOnlyNotice";
import { WebhookHealthPanel } from "./components/WebhookHealthPanel";

export const Connection = () => {
  const { t } = useTranslation(["settings", "nav"]);
  const connection = useLineConnection();

  if (connection.isForbidden)
    return (
      <div className="mx-auto mt-6 mb-12 max-w-[1080px]">
        <OwnerOnlyNotice />
      </div>
    );

  return (
    <div className="mx-auto max-w-[1080px] pt-6 pb-16">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">
        {t("nav:item.settingConnection")}
      </h1>
      <p className="mt-1.5 text-sm text-normal">{t("settings:connection.pageSubtitle")}</p>

    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col">
        <WebhookCard
          url={connection.webhookUrl}
          ready={connection.webhookReady}
          needsManual={connection.webhookNeedsManual}
        >
          {connection.state?.connected && (
            <WebhookHealthPanel webhookSetAt={connection.state.webhookSetAt} />
          )}
        </WebhookCard>
        <LineCredentialsCard
          form={connection.form}
          state={connection.state}
          locked={connection.locked}
          canCancel={connection.canCancel}
          canSubmit={connection.canSubmit}
          isSaving={connection.isSaving}
          onSubmit={connection.submit}
          onEdit={connection.startEdit}
          onCancel={connection.cancelEdit}
          onReset={connection.reset}
        />
      </div>

      <ConnectionStatusCard
        status={connection.status}
        loading={connection.isLoading}
        state={connection.state}
        celebrate={connection.justConnected}
        errorMessage={connection.errorMessage}
        webhookReady={connection.webhookReady}
      />
    </div>
    </div>
  );
};

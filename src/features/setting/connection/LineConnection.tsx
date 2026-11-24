import { useLineConnection } from "./hooks/useLineConnection";
import { WebhookCard } from "./components/WebhookCard";
import { LineCredentialsCard } from "./components/LineCredentialsCard";
import { ConnectionStatusCard } from "./components/ConnectionStatusCard";
import { OwnerOnlyNotice } from "./components/OwnerOnlyNotice";
import { WebhookHealthPanel } from "./components/WebhookHealthPanel";

export const LineConnection = () => {
  const connection = useLineConnection();

  if (connection.isForbidden)
    return (
      <div className="mt-6">
        <OwnerOnlyNotice />
      </div>
    );

  return (
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
  );
};

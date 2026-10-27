import { useLineConnection } from "./hooks/useLineConnection";
import { WebhookCard } from "./components/WebhookCard";
import { LineCredentialsCard } from "./components/LineCredentialsCard";
import { ConnectionStatusCard } from "./components/ConnectionStatusCard";
import { WebhookHealthPanel } from "./components/WebhookHealthPanel";

export const Connection = () => {
  const connection = useLineConnection();

  return (
    <div className="mt-6 mb-12 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
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

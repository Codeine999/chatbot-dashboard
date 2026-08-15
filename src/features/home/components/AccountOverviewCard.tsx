import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Clock,
  Copy,
  Eye,
  MessagesSquare,
  RefreshCw,
  Webhook,
} from "lucide-react";
import { useLineOaInfo } from "../hooks/useLineOaDashboard";

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const AccountOverviewCard = () => {
  const {
    data: account,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useLineOaInfo();
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.basicId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Cannot copy basic id:", error);
    }
  };

  const infoRows = account
    ? [
        {
          icon: MessagesSquare,
          label: "Chat mode",
          value: capitalize(account.chatMode),
        },
        {
          icon: Eye,
          label: "Mark as read mode",
          value: capitalize(account.markAsReadMode),
        },
        { icon: Webhook, label: "Webhook", value: "Connected", status: true },
        {
          icon: Clock,
          label: "Last sync",
          value: dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : "—",
        },
      ]
    : [];

  return (
    <Card className="p-6 h-[384px] flex flex-col overflow-auto">
      <div className="flex items-center justify-between">
        <CardTitle>Account Overview</CardTitle>
        <Button
          variant="ghost"
          className="rounded-full border text-xs gap-1.5"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`!w-4 !h-4 text-mini ${isFetching ? "animate-spin" : ""}`}
          />
          Sync info
        </Button>
      </div>

      {isLoading && (
        <p className="mt-5 text-sm text-mini">Loading LINE OA info…</p>
      )}

      {isError && (
        <p className="mt-5 text-sm text-red-600">Failed to load LINE OA info.</p>
      )}

      {account && (
        <>
          <div className="mt-5 flex items-center gap-4">
            {account.pictureUrl ? (
              <img
                src={account.pictureUrl}
                alt={account.displayName}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full
                  bg-green-600 px-2 text-center text-[11px] font-semibold leading-tight text-white"
              >
                {getInitials(account.displayName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-normal">
                {account.displayName}
              </p>

              <button
                type="button"
                onClick={handleCopyId}
                className="mt-0.5 flex items-center gap-1.5 text-sm text-mini transition hover:text-normal"
              >
                {account.basicId}
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              <span
                className="mt-2 inline-flex rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium
                  text-green-700 dark:bg-green-500/10 dark:text-green-400"
              >
                Active
              </span>
            </div>
          </div>

          <div className="mt-5 flex-1 border-t pt-2">
            {infoRows.map(({ icon: Icon, label, value, status }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-mini" />
                  <span className="text-sm text-mini">{label}</span>
                </div>

                <span className="flex items-center gap-2 text-sm font-medium text-normal">
                  {status && (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                  {value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default AccountOverviewCard;

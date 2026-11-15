import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorFace from "@/assets/icon/error/error-face.svg";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  LoaderCircle,
  MessagesSquare,
  RefreshCw,
  Webhook,
} from "lucide-react";
import {
  useLineOaInfo,
  useMyAiProviderCatalog,
  useUpdateAdminAiProviderSetting,
} from "../hooks/useLineOaDashboard";
import { useTranslation } from "react-i18next";
import { formatDate, formatNumber, formatTime } from "@/i18n/format";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { useAdminUsage } from "@/features/usage/hooks/useAdminUsage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

type AccountChannel = "Line" | "Facebook" | "Api";
const ACCOUNT_CHANNELS: AccountChannel[] = ["Line", "Facebook", "Api"];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const modelValue = (provider: string, model: string) =>
  `${provider}::${model}`;

const AccountOverviewCard = () => {
  const { t } = useTranslation("home");
  const user = useAuthUser();
  const { data: adminUsage } = useAdminUsage();
  const creditLimit = adminUsage?.admin.limit ?? 0;
  const creditRemaining = Math.max(creditLimit - (adminUsage?.admin.used ?? 0), 0);
  const {
    data: account,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useLineOaInfo();
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<AccountChannel>("Line");
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [selectedModelValue, setSelectedModelValue] = useState("");
  const canChangeAiModel = ["dev", "owner", "admin"].includes(
    user?.role ?? ""
  );
  const catalogQuery = useMyAiProviderCatalog(
    canChangeAiModel && modelDialogOpen
  );
  const updateModelMutation = useUpdateAdminAiProviderSetting();
  const userAiSetting = account?.aiProviderSettings?.find(
    (setting) => setting.scope === "USER"
  );
  const adminAiSetting = account?.aiProviderSettings?.find(
    (setting) => setting.scope === "ADMIN"
  );
  const activeAiSetting = adminAiSetting ?? userAiSetting;
  const modelOptions = (catalogQuery.data ?? []).flatMap((provider) =>
    provider.models.map((model) => ({
      provider: provider.provider,
      providerLabel: provider.label,
      available: provider.available,
      model,
    }))
  );

  const openModelDialog = () => {
    setSelectedModelValue(
      activeAiSetting
        ? modelValue(activeAiSetting.provider, activeAiSetting.model)
        : ""
    );
    setModelDialogOpen(true);
  };

  const saveModel = async () => {
    const selected = modelOptions.find(
      (option) =>
        modelValue(option.provider, option.model) === selectedModelValue
    );
    if (!selected) return;

    try {
      await updateModelMutation.mutateAsync({
        scope: "ADMIN",
        provider: selected.provider,
        model: selected.model,
      });
      setModelDialogOpen(false);
    } catch {
      // The mutation shows the API error and keeps the dialog open to retry.
    }
  };

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
          label: t("account.replyWith"),
          value: activeAiSetting?.model ?? "—",
          editable: true,
        },
        {
          icon: Eye,
          label: t("account.markAsReadMode"),
          value: capitalize(account.markAsReadMode),
        },
        {
          icon: Webhook,
          label: t("account.webhook"),
          value: t("account.webhookConnected"),
          status: true,
        },
        {
          icon: Clock,
          label: t("account.lastSync"),
          value: dataUpdatedAt
            ? `${formatDate(new Date(dataUpdatedAt).toISOString())} ${formatTime(new Date(dataUpdatedAt).toISOString())}`
            : "—",
        },
      ]
    : [];

  return (
    <Card variant="flat" className="flex h-full min-h-[340px] flex-col">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{t("account.title")}</CardTitle>
        <Button
          variant="pill"
          className="h-9 rounded-full px-3.5 text-[13px] font-medium gap-1.5"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`!w-4 !h-4 text-mini ${isFetching ? "animate-spin" : ""}`}
          />
          {t(isError ? "account.retry" : "account.sync")}
        </Button>
      </div>

      {account && (
        <>
          <div role="tablist" className="mt-4 flex w-fit gap-0.5 rounded-[10px] bg-muted p-[3px]">
            {ACCOUNT_CHANNELS.map((item) => {
              const isActive = item === channel;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setChannel(item)}
                  className={`cursor-pointer h-8 rounded-lg px-3 text-[13px] outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                    isActive
                      ? "bg-background font-medium text-foreground shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]"
                      : "font-medium text-normal hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4">
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
              <p className="truncate text-base font-semibold text-foreground">
                {account.displayName}
              </p>

              <button
                type="button"
                onClick={handleCopyId}
                className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
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
                {t("account.active")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex-1 border-t pt-2">
            {infoRows.map(({ icon: Icon, label, value, status, editable }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {status && (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                  {editable && canChangeAiModel ? (
                    <button
                      type="button"
                      onClick={openModelDialog}
                      disabled={updateModelMutation.isPending}
                      className="flex max-w-[13rem] items-center gap-1 rounded-md px-1.5 py-1 text-right transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                      title={t("account.changeModel")}
                    >
                      <span className="truncate">{value}</span>
                      {updateModelMutation.isPending ? (
                        <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
                      ) : (
                        <ChevronDown className="size-3.5 shrink-0 text-mini" />
                      )}
                    </button>
                  ) : (
                    value
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("account.aiCredit")}</span>
              <Link to="/usage" className="font-medium text-foreground underline underline-offset-4">
                {t("account.viewUsage")}
              </Link>
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
              {formatNumber(creditRemaining)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {formatNumber(creditLimit)}
              </span>
            </p>
          </div>
        </>
      )}

      {isLoading && (
        <div role="status" aria-label={t("account.loading")}>
          <div className="mt-6 flex items-center gap-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>

          <div className="mt-5 border-t pt-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <img src={ErrorFace} alt="" className="mb-3 size-24 opacity-40" />
          <p className="mt-3.5 text-lg font-semibold text-foreground">
            {t("account.notConnectedTitle")}
          </p>
          <p className="text-sm leading-normal text-muted-foreground">{t("account.notConnectedDescription")}</p>
          <Button asChild className="mt-3.5 h-11 rounded-full bg-black px-[26px] text-[15px] font-medium text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85">
            <Link to="/setting/connection">{t("account.goConnect")}</Link>
          </Button>
        </div>
      )}

      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("account.changeModel")}</DialogTitle>
            <DialogDescription>
              {t("account.changeModelDescription")}
            </DialogDescription>
          </DialogHeader>

          {catalogQuery.isLoading ? (
            <div className="flex h-20 items-center justify-center gap-2 text-sm text-mini">
              <LoaderCircle className="size-4 animate-spin" />
              {t("account.loadingModels")}
            </div>
          ) : catalogQuery.isError ? (
            <p className="text-sm text-red-600">{t("account.modelsError")}</p>
          ) : (
            <Select
            value={selectedModelValue}
              onValueChange={setSelectedModelValue}
              disabled={updateModelMutation.isPending || modelOptions.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("account.selectModel")} />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem
                    key={modelValue(option.provider, option.model)}
                    value={modelValue(option.provider, option.model)}
                    disabled={!option.available}
                  >
                    {option.model} · {option.providerLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModelDialogOpen(false)}
              disabled={updateModelMutation.isPending}
            >
              {t("account.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void saveModel()}
              disabled={
                catalogQuery.isLoading ||
                catalogQuery.isError ||
                !selectedModelValue ||
                updateModelMutation.isPending
              }
            >
              {updateModelMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {t("account.saveModel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AccountOverviewCard;

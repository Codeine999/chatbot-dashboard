import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { formatDate, formatTime } from "@/i18n/format";
import { useAuthUser } from "@/features/auth/store/auth.store";
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

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const modelValue = (provider: string, model: string) =>
  `${provider}::${model}`;

const AccountOverviewCard = () => {
  const { t } = useTranslation("home");
  const user = useAuthUser();
  const {
    data: account,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useLineOaInfo();
  const [copied, setCopied] = useState(false);
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
          icon: MessagesSquare,
          label: t("account.chatMode"),
          value: capitalize(account.chatMode),
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

  // h-full เพื่อยืดสูงเท่าการ์ดกราฟที่อยู่ข้าง ๆ ใน grid เดียวกัน
  // การ์ดกราฟสูงตามเนื้อหา ถ้าล็อกความสูงตายตัวไว้จะเหลือช่องว่างใต้การ์ดนี้
  // min-h กันไม่ให้เตี้ยกว่าเดิมตอนอยู่ลำพัง
  return (
    <Card className="flex h-full min-h-[384px] flex-col overflow-auto p-6">
      <div className="flex items-center justify-between">
        <CardTitle>{t("account.title")}</CardTitle>
        <Button
          variant="ghost"
          className="rounded-full border text-xs gap-1.5"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`!w-4 !h-4 text-mini ${isFetching ? "animate-spin" : ""}`}
          />
          {t("account.sync")}
        </Button>
      </div>

      {isLoading && (
        <p className="mt-5 text-sm text-mini">{t("account.loading")}</p>
      )}

      {isError && (
        <p className="mt-5 text-sm text-red-600">{t("account.error")}</p>
      )}

      {account && (
        <>
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
                {t("account.active")}
              </span>
            </div>
          </div>

          <div className="mt-5 flex-1 border-t pt-2">
            {infoRows.map(({ icon: Icon, label, value, status, editable }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-mini" />
                  <span className="text-sm text-mini">{label}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-normal">
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
        </>
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

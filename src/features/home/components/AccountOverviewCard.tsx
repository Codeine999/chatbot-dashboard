import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ErrorFace from "@/assets/icon/error/error-face.svg";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedNumber,
  SegmentedTabs,
  StaggerGroup,
  StaggerItem,
  type SegmentedTabOption,
} from "@/components/motion";
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from "@/lib/motion";
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
const CHANNEL_OPTIONS: ReadonlyArray<SegmentedTabOption<AccountChannel>> = [
  { value: "Line", label: "Line" },
  { value: "Facebook", label: "Facebook" },
  { value: "Api", label: "Api" },
];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const modelValue = (provider: string, model: string) =>
  `${provider}::${model}`;

const AccountOverviewCard = () => {
  const { t } = useTranslation("home");
  const prefersReduced = useReducedMotion();
  const user = useAuthUser();
  const isDev = user?.role === "dev";
  const { data: adminUsage } = useAdminUsage(isDev);
  // limit เป็น null = แอดมินคนนี้ไม่ได้ตั้งเพดาน ให้ใช้เครดิตคงเหลือของบริษัทแทน (ไม่ใช่ 0)
  const creditLimit = adminUsage?.admin.limit ?? null;
  const creditRemaining =
    creditLimit === null
      ? (adminUsage?.company.balance ?? 0)
      : Math.max(creditLimit - (adminUsage?.admin.used ?? 0), 0);
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

  const viewState = account
    ? "ready"
    : isLoading
      ? "loading"
      : isError
        ? "error"
        : "empty";

  const stateTransition = {
    duration: MOTION_DURATION.fast,
    ease: MOTION_EASE.out,
  };

  return (
    <Card variant="flat" className="flex h-full min-h-[340px] flex-col">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          {t("account.title")}
        </CardTitle>
        <motion.div
          whileTap={prefersReduced ? undefined : { scale: 0.96 }}
          transition={MOTION_SPRING.snappy}
        >
          <Button
            variant="pill"
            className="h-9 gap-1.5 rounded-full px-3.5 text-[13px] font-medium"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`!h-4 !w-4 text-mini ${isFetching ? "animate-spin" : ""}`}
            />
            {t(isError ? "account.retry" : "account.sync")}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {viewState === "ready" && account && (
          <motion.div
            key="ready"
            className="flex flex-1 flex-col"
            initial={prefersReduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            transition={stateTransition}
          >
            <SegmentedTabs
              options={CHANNEL_OPTIONS}
              value={channel}
              onChange={setChannel}
              ariaLabel={t("account.title")}
              className="mt-4"
            />

            <div className="mt-6 flex items-center gap-4">
              {account.pictureUrl ? (
                <img
                  src={account.pictureUrl}
                  alt={account.displayName}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-border/60"
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

                <motion.button
                  type="button"
                  onClick={handleCopyId}
                  whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                  className="mt-0.5 flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>{account.basicId}</span>
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={prefersReduced ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={prefersReduced ? undefined : { scale: 0.6, opacity: 0 }}
                        transition={MOTION_SPRING.snappy}
                        className="inline-flex"
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={prefersReduced ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={prefersReduced ? undefined : { scale: 0.6, opacity: 0 }}
                        transition={MOTION_SPRING.snappy}
                        className="inline-flex"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <span
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium
                    text-green-700 dark:bg-green-500/10 dark:text-green-400"
                >
                  {t("account.active")}
                </span>
              </div>
            </div>

            <StaggerGroup
              stagger={0.055}
              delayChildren={0.08}
              className="mt-6 flex-1 border-t pt-2"
            >
              {infoRows.map(({ icon: Icon, label, value, status, editable }) => (
                <StaggerItem
                  key={label}
                  y={10}
                  duration={MOTION_DURATION.base}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {status && (
                      <span className="relative flex size-2">
                        {!prefersReduced && (
                          <motion.span
                            aria-hidden="true"
                            className="absolute inline-flex h-full w-full rounded-full bg-green-500"
                            animate={{ scale: [1, 2.1], opacity: [0.5, 0] }}
                            transition={{
                              duration: 2.8,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                        )}
                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                      </span>
                    )}
                    {editable && canChangeAiModel ? (
                      <motion.button
                        type="button"
                        onClick={openModelDialog}
                        disabled={updateModelMutation.isPending}
                        whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                        className="flex max-w-[13rem] cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-right transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                        title={t("account.changeModel")}
                      >
                        <span className="truncate">{value}</span>
                        {updateModelMutation.isPending ? (
                          <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
                        ) : (
                          <ChevronDown className="size-3.5 shrink-0 text-mini" />
                        )}
                      </motion.button>
                    ) : (
                      value
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>

            {isDev && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("account.aiCredit")}
                  </span>
                  <Link
                    to="/usage"
                    className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-75"
                  >
                    {t("account.viewUsage")}
                  </Link>
                </div>
                <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                  <AnimatedNumber value={creditRemaining} />
                  {creditLimit !== null && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      / {formatNumber(creditLimit)}
                    </span>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {viewState === "loading" && (
          <motion.div
            key="loading"
            role="status"
            aria-label={t("account.loading")}
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={stateTransition}
          >
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
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {viewState === "error" && (
          <motion.div
            key="error"
            className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center"
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            transition={stateTransition}
          >
            <img src={ErrorFace} alt="" className="mb-3 size-24 opacity-40" />
            <p className="mt-3.5 text-lg font-semibold text-foreground">
              {t("account.notConnectedTitle")}
            </p>
            <p className="text-sm leading-normal text-muted-foreground">
              {t("account.notConnectedDescription")}
            </p>
            <motion.div
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
              transition={MOTION_SPRING.snappy}
            >
              <Button
                asChild
                className="mt-3.5 h-11 rounded-full bg-black px-[26px] text-[15px] font-medium text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
              >
                <Link to="/setting/connection">{t("account.goConnect")}</Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              disabled={
                updateModelMutation.isPending || modelOptions.length === 0
              }
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

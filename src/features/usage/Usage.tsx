import {
  Bot,
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/api/api";
import { useAdminUsage } from "./hooks/useAdminUsage";
import { useLinePushMessageUsage } from "./hooks/useLinePushMessageUsage";
import { useUsageAccounts } from "./hooks/useUsageAccounts";
import type { UsageAccountItem } from "./services/usage.service";
import { useTranslation } from "react-i18next";
import { formatNumber as formatLocaleNumber } from "@/i18n/format";

const formatNumber = (value: number) =>
  formatLocaleNumber(value, { maximumFractionDigits: 2 });

const getPercent = (used: number, limit: number) =>
  limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

/** keep small usages visible instead of rounding them down to 0% */
const formatPercent = (percent: number) =>
  percent > 0 && percent < 1 ? percent.toFixed(2) : Math.round(percent).toString();

const statusStyle: Record<UsageAccountItem["status"], string> = {
  active:
    "bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
  trial:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  inactive: "bg-muted text-mini ring-border",
};

function StatusBadge({ status }: { status: UsageAccountItem["status"] }) {
  const { t } = useTranslation("usage");

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyle[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function UsageOverviewRow({
  title,
  description,
  used,
  limit,
  icon: Icon,
  iconClassName,
  progressClassName,
}: {
  title: string;
  description: string;
  used: number;
  limit: number;
  icon: LucideIcon;
  iconClassName: string;
  progressClassName: string;
}) {
  const { t } = useTranslation("usage");
  const percent = getPercent(used, limit);
  const remaining = Math.max(limit - used, 0);

  return (
    <div className="group px-5 py-6 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105 ${iconClassName}`}
          >
            <Icon className="size-5" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-normal">{title}</p>
            <p className="mt-1 text-sm text-mini">{description}</p>
          </div>
        </div>

        <div className="pl-[3.75rem] sm:pl-0 sm:text-right">
          <p className="text-3xl font-semibold tracking-[-0.04em] text-normal">
            {formatNumber(remaining)}
          </p>
          <p className="mt-1 text-xs font-medium text-mini">
            {t("token.remainingOf", { limit: formatNumber(limit) })}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2.5 overflow-hidden rounded-full bg-muted/80 ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.04]">
          <div
            className={`h-full rounded-full bg-gradient-to-r shadow-[0_0_16px_rgba(124,58,237,0.28)] transition-[width] duration-700 ease-out ${progressClassName}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="font-semibold text-normal">
            {t("token.used", { used: formatNumber(used) })}{" "}
            <span className="mx-1 text-mini">·</span> {formatPercent(percent)}%
          </p>
          <p className="flex items-center gap-1.5 font-medium text-mini">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            {t("token.withinAllowance")}
          </p>
        </div>
      </div>
    </div>
  );
}

function CreditUsageRow({
  label,
  used,
  limit,
  color,
}: {
  label: string;
  used: number;
  limit: number;
  color: string;
}) {
  const { t } = useTranslation("usage");
  const percent = getPercent(used, limit);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-normal">{label}</p>
          <p className="mt-0.5 text-xs text-mini">
            {t("account.credits", {
              used: formatNumber(used),
              limit: formatNumber(limit),
            })}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-normal">
          {formatPercent(percent)}%
        </span>
      </div>
      <ProgressBar value={percent} color={color} />
    </div>
  );
}

function AccountUsageCard({ account }: { account: UsageAccountItem }) {
  const { t } = useTranslation("usage");
  const initials = account.username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-500/10 dark:to-blue-500/10">
              <AvatarFallback className="bg-transparent text-sm font-semibold text-normal">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base text-normal">{account.username}</CardTitle>
              <CardDescription className="mt-1 whitespace-normal text-xs">
                {account.role}
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={account.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5 pt-2.5">
        <CreditUsageRow
          label={t("account.aiCredit")}
          used={account.aiUsed}
          limit={account.aiLimit ?? 0}
          color="bg-orange-500"
        />
        {account.chatUsed !== null && (
          <CreditUsageRow
            label={t("account.chatCredit")}
            used={account.chatUsed}
            limit={account.chatLimit ?? 0}
            color="bg-blue-500"
          />
        )}

        <div className="flex items-center justify-between rounded-xl border bg-muted px-3 py-2.5 text-xs text-mini">
          <span>{t("account.health")}</span>
          <span className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("account.operational")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const Usage = () => {
  const { t } = useTranslation("usage");
  const {
    data: adminUsage,
    isLoading: isAdminUsageLoading,
    isError: isAdminUsageError,
  } = useAdminUsage();
  const {
    data: usageAccounts = [],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    error: accountsError,
  } = useUsageAccounts();
  const {
    data: linePushUsage,
    isLoading: isLinePushLoading,
    isError: isLinePushError,
  } = useLinePushMessageUsage();

  const totalChatUsed = linePushUsage?.used ?? 0;
  const totalChatLimit = linePushUsage?.limit ?? 0;
  const aiChatUsed = adminUsage?.company.used ?? 0;
  const aiChatLimit = adminUsage?.company.balance ?? 0;
  const adminUsed = adminUsage?.admin.used ?? 0;
  // admin wallet has no balance of its own, fall back to the company balance when uncapped
  const adminLimit = adminUsage?.admin.limit ?? adminUsage?.company.balance ?? 0;
  const activeAccounts = usageAccounts.filter((item) => item.status === "active").length;

  return (
    <div className="mt-10 mb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal">{t("title")}</h1>
          <p className="mt-2 text-sm text-mini">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium text-mini shadow-sm">
          <Sparkles className="h-4 w-4 text-orange-500" />
          {isAdminUsageLoading || isLinePushLoading
            ? t("sync.syncing")
            : isAdminUsageError || isLinePushError
              ? t("sync.fallback")
              : t("sync.updated")}
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-white/50 px-5 py-5 dark:border-border sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-base font-semibold tracking-tight text-normal">{t("token.title")}</p>
            <p className="mt-1 text-xs text-mini">{t("token.subtitle")}</p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
            {t("token.connected", { active: activeAccounts, total: usageAccounts.length })}
          </div>
        </div>

        <div className="grid divide-y divide-white/50 dark:divide-border xl:grid-cols-3 xl:divide-x xl:divide-y-0">
          <UsageOverviewRow
            title={t("token.aiChat")}
            description={t("token.aiChatDesc")}
            used={aiChatUsed}
            limit={aiChatLimit}
            icon={Bot}
            iconClassName="bg-indigo-50/80 text-indigo-600 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20"
            progressClassName="from-indigo-600 via-violet-500 to-fuchsia-500"
          />
          <UsageOverviewRow
            title={t("token.lineSend")}
            description={t("token.lineSendDesc")}
            used={totalChatUsed}
            limit={totalChatLimit}
            icon={Send}
            iconClassName="bg-emerald-50/80 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
            progressClassName="from-emerald-500 via-teal-400 to-cyan-400"
          />
          <UsageOverviewRow
            title={t("token.admin")}
            description={t("token.adminDesc")}
            used={adminUsed}
            limit={adminLimit}
            icon={ShieldCheck}
            iconClassName="bg-orange-50/80 text-orange-600 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20"
            progressClassName="from-orange-500 via-amber-400 to-yellow-400"
          />
        </div>
      </Card>

      {isAccountsLoading ? (
        <Card className="mt-6 px-5 py-8 text-sm text-mini">{t("account.loading")}</Card>
      ) : isAccountsError ? (
        <Card className="mt-6 px-5 py-8 text-sm text-mini">
          {t("account.error", { message: getApiErrorMessage(accountsError) })}
        </Card>
      ) : usageAccounts.length === 0 ? (
        <Card className="mt-6 px-5 py-8 text-sm text-mini">{t("account.empty")}</Card>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {usageAccounts.map((account) => (
            <AccountUsageCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
};

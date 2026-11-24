import { CheckCircle2, RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "@/api/api";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { useAdminUsage } from "./hooks/useAdminUsage";
import { useLinePushMessageUsage } from "./hooks/useLinePushMessageUsage";
import { useUsageAccounts } from "./hooks/useUsageAccounts";
import type { UsageAccountItem, UsageReplyChannel } from "./services/usage.service";
import { useTranslation } from "react-i18next";
import { formatNumber as formatLocaleNumber, getIntlLocale } from "@/i18n/format";
import { useState } from "react";
import { USAGE_REPLIES_PAGE_SIZE, useUsageReplies } from "./hooks/useUsageReplies";
import {
  TOKEN_CHANNEL_MOCK,
  TOKEN_CHANNELS,
  type TokenChannel,
  type TokenChannelMock,
} from "./mock/tokenChannel.mock";

const formatNumber = (value: number) => formatLocaleNumber(value, { maximumFractionDigits: 2 });

const getPercent = (used: number, limit: number) =>
  limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

/** keep small usages visible instead of rounding them down to 0% */
const formatPercent = (percent: number) =>
  percent > 0 && percent < 1 ? percent.toFixed(2) : Math.round(percent).toString();

const REPLY_CHANNEL: Record<Exclude<TokenChannel, "overall">, UsageReplyChannel> = {
  line: "LINE",
  facebook: "FACEBOOK",
  api: "APPLICATION",
};

const REPLY_CHANNEL_LABEL: Record<UsageReplyChannel, Exclude<TokenChannel, "overall">> = {
  LINE: "line",
  FACEBOOK: "facebook",
  APPLICATION: "api",
};

const statusDot: Record<UsageAccountItem["status"], string> = {
  active: "bg-[#16a34a]",
  trial: "bg-[#f59e0b]",
  inactive: "bg-[#a3a3a3]",
};

function TokenColumn({
  title,
  description,
  used,
  limit,
  color,
  first,
}: {
  title: string;
  description: string;
  used: number;
  limit: number;
  color: string;
  first?: boolean;
}) {
  const { t } = useTranslation("usage");
  const percent = getPercent(used, limit);
  const remaining = Math.max(limit - used, 0);

  return (
    <div className={`px-7 ${first ? "border-l-0 pl-0" : "border-l"}`}>
      <div className="flex items-center gap-2 text-[13px] text-normal">
        <span className="size-2 rounded-[2px]" style={{ background: color }} />
        {title}
      </div>
      <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.03em] text-foreground">
        {formatNumber(remaining)}
      </p>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {t("token.remainingOf", { limit: formatNumber(limit) })}
      </p>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${percent}%`,
            minWidth: percent > 0 ? 3 : 0,
            background: color,
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-foreground">
          {t("token.used", { used: formatNumber(used) })}
          <span className="mx-1.5 text-muted-foreground">·</span>
          {formatPercent(percent)}%
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-[#16a34a]" />
          {t("token.withinAllowance")}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ChannelFilterTabs({
  value,
  onChange,
  label,
}: {
  value: TokenChannel;
  onChange: (value: TokenChannel) => void;
  label: string;
}) {
  const { t } = useTranslation("usage");
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-fit gap-0.5 rounded-[10px] bg-muted p-[3px]"
    >
      {TOKEN_CHANNELS.map((item) => {
        const isActive = item === value;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item)}
            className={`cursor-pointer h-8 rounded-lg px-3 text-[13px] outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
              isActive
                ? "bg-background font-medium text-foreground shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]"
                : "font-medium text-normal hover:text-foreground"
            }`}
          >
            {t(`token.channels.${item}`)}
          </button>
        );
      })}
    </div>
  );
}

const formatLogTime = (value: string) =>
  new Intl.DateTimeFormat(getIntlLocale(), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function AdminRow({ account }: { account: UsageAccountItem }) {
  const { t } = useTranslation("usage");
  const initials = account.username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const limit = account.aiLimit ?? 0;
  const percent = getPercent(account.aiUsed, limit);

  return (
    <tr className="border-b border-black/5 transition-colors hover:bg-[#fafafa] dark:border-white/5 dark:hover:bg-white/[0.03]">
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-3">
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-semibold text-foreground dark:bg-white/10">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{account.username}</p>
            <p className="truncate text-xs text-muted-foreground">{account.role}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-4">
        <span className="flex items-center gap-2 text-[13px] text-normal">
          <span className={`size-1.5 rounded-full ${statusDot[account.status]}`} />
          {t(`status.${account.status}`)}
        </span>
      </td>
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[#ea580c]"
              style={{ width: `${percent}%`, minWidth: percent > 0 ? 3 : 0 }}
            />
          </div>
          <span className="w-44 shrink-0 text-right text-[13px] tabular-nums text-normal">
            {formatNumber(account.aiUsed)} / {formatNumber(limit)}
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {formatPercent(percent)}%
            </span>
          </span>
        </div>
      </td>
      <td className="py-3.5 text-right">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[#15803d] dark:text-green-400">
          <CheckCircle2 className="size-3.5" />
          {t("account.operational")}
        </span>
      </td>
    </tr>
  );
}

export const Usage = () => {
  const { t } = useTranslation("usage");
  const {
    data: adminUsage,
    isLoading: isAdminUsageLoading,
    isError: isAdminUsageError,
    refetch: refetchAdmin,
  } = useAdminUsage();
  const {
    data: usageAccounts = [],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    error: accountsError,
    refetch: refetchAccounts,
  } = useUsageAccounts();
  const {
    data: linePushUsage,
    isLoading: isLinePushLoading,
    isError: isLinePushError,
    refetch: refetchLine,
  } = useLinePushMessageUsage();

  const activeAccounts = usageAccounts.filter((item) => item.status === "active").length;

  // real totals for "overall"; per-channel values are mock until the API splits them by channel
  const [tokenChannel, setTokenChannel] = useState<TokenChannel>("overall");
  const aiChatUsed = adminUsage?.company.used ?? 0;
  const aiChatLimit = adminUsage?.company.balance ?? 0;
  const adminUsed = adminUsage?.admin.used ?? 0;
  // admin wallet has no balance of its own, fall back to the company balance when uncapped
  const adminLimit = adminUsage?.admin.limit ?? adminUsage?.company.balance ?? 0;
  const totalChatUsed = linePushUsage?.used ?? 0;
  const totalChatLimit = linePushUsage?.limit ?? 0;
  const tokenValues: TokenChannelMock =
    tokenChannel === "overall"
      ? {
          aiChat: { used: aiChatUsed, limit: aiChatLimit },
          lineSend: { used: totalChatUsed, limit: totalChatLimit },
          admin: { used: adminUsed, limit: adminLimit },
        }
      : TOKEN_CHANNEL_MOCK[tokenChannel];
  const [logPage, setLogPage] = useState(1);
  const {
    data: replyLog,
    isLoading: isLogLoading,
    isError: isLogError,
    error: logError,
  } = useUsageReplies(
    tokenChannel === "overall" ? undefined : REPLY_CHANNEL[tokenChannel],
    logPage
  );
  const logItems = replyLog?.items ?? [];
  const logPages = Math.max(1, Math.ceil((replyLog?.total ?? 0) / USAGE_REPLIES_PAGE_SIZE));
  const changeChannel = (channel: TokenChannel) => {
    setTokenChannel(channel);
    setLogPage(1);
  };
  const totalPersonTokens = usageAccounts.reduce((sum, item) => sum + item.aiUsed, 0);

  const syncing = isAdminUsageLoading || isLinePushLoading;
  const refresh = () => {
    void refetchAdmin();
    void refetchAccounts();
    void refetchLine();
  };
  const noteClass = "mt-6 text-sm text-muted-foreground";

  return (
    <PageContainer className="pb-16">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground">
              {syncing
                ? t("sync.syncing")
                : isAdminUsageError || isLinePushError
                  ? t("sync.fallback")
                  : t("sync.updated")}
            </span>
            <button
              type="button"
              onClick={refresh}
              aria-label={t("refresh")}
              className="flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] border text-normal transition-colors hover:bg-muted"
            >
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      <div className="mt-11 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("token.title")}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("token.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 text-[13px] text-normal">
            <span className="size-2 rounded-full bg-[#16a34a] shadow-[0_0_0_3px_rgba(22,163,74,0.15)]" />
            {t("token.connected", {
              active: activeAccounts,
              total: usageAccounts.length,
            })}
          </span>
          <ChannelFilterTabs
            value={tokenChannel}
            onChange={changeChannel}
            label={t("token.log.filter")}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-y-8 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        <TokenColumn
          first
          title={t("token.aiChat")}
          description={t("token.aiChatDesc")}
          used={tokenValues.aiChat.used}
          limit={tokenValues.aiChat.limit}
          color="#8b5cf6"
        />
        <TokenColumn
          title={t("token.lineSend")}
          description={t("token.lineSendDesc")}
          used={tokenValues.lineSend.used}
          limit={tokenValues.lineSend.limit}
          color="#16a34a"
        />
        <TokenColumn
          title={t("token.admin")}
          description={t("token.adminDesc")}
          used={tokenValues.admin.used}
          limit={tokenValues.admin.limit}
          color="#ea580c"
        />
      </div>

      <div className="mt-12 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-foreground">{t("token.perPerson.title")}</h3>
        <span className="text-[13px] text-muted-foreground">
          {t("token.perPerson.total", {
            used: formatNumber(totalPersonTokens),
          })}
        </span>
      </div>

      {isAccountsLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("account.loading")}</p>
      ) : isAccountsError ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("account.error", { message: getApiErrorMessage(accountsError) })}
        </p>
      ) : usageAccounts.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("account.empty")}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b text-xs font-medium text-muted-foreground">
                <th className="py-2.5 pr-4 font-medium">{t("table.admin")}</th>
                <th className="py-2.5 pr-4 font-medium">{t("token.perPerson.used")}</th>
                <th className="py-2.5 pr-4 font-medium">{t("token.perPerson.limit")}</th>
                <th className="py-2.5 pr-4 font-medium">{t("token.perPerson.share")}</th>
              </tr>
            </thead>
            <tbody>
              {usageAccounts.map((account) => {
                const limit = account.aiLimit ?? 0;
                const percent = getPercent(account.aiUsed, limit);
                return (
                  <tr
                    key={account.id}
                    className="border-b border-black/5 transition-colors hover:bg-[#fafafa] dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-4">
                      <p className="truncate text-sm font-medium text-foreground">
                        {account.username}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{account.role}</p>
                    </td>
                    <td className="py-3 pr-4 text-[13px] tabular-nums text-normal">
                      {formatNumber(account.aiUsed)}
                    </td>
                    <td className="py-3 pr-4 text-[13px] tabular-nums text-normal">
                      {formatNumber(limit)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-32 overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#8b5cf6]"
                            style={{
                              width: `${percent}%`,
                              minWidth: percent > 0 ? 3 : 0,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatPercent(percent)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-[15px] font-semibold text-foreground">{t("token.log.title")}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{t("token.log.note")}</p>
      </div>

      {isLogLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("token.log.loading")}</p>
      ) : isLogError ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("token.log.error", { message: getApiErrorMessage(logError) })}
        </p>
      ) : logItems.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("token.log.empty")}</p>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b text-xs font-medium text-muted-foreground">
                  <th className="py-2.5 pr-4 font-medium">{t("token.log.time")}</th>
                  <th className="py-2.5 pr-4 font-medium">{t("token.log.channel")}</th>
                  <th className="py-2.5 pr-4 font-medium">{t("token.log.respondedBy")}</th>
                  <th className="py-2.5 pr-4 font-medium">{t("token.log.answerType")}</th>
                  <th className="py-2.5 text-right font-medium">{t("token.log.credit")}</th>
                </tr>
              </thead>
              <tbody>
                {logItems.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-black/5 transition-colors hover:bg-[#fafafa] dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {formatLogTime(entry.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-normal">
                      {entry.channel
                        ? t(`token.channels.${REPLY_CHANNEL_LABEL[entry.channel]}`)
                        : t("token.channels.unknown")}
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-normal">
                      {entry.respondedBy === "AI"
                        ? t("token.log.ai")
                        : (entry.adminUsername ?? t("token.log.admin"))}
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-normal">
                      {entry.answerType
                        ? t(`token.answerTypes.${entry.answerType}`, {
                            defaultValue: entry.answerType,
                          })
                        : "—"}
                      {entry.status === "failed" && (
                        <span className="ml-2 text-xs text-[#dc2626]">{t("token.log.failed")}</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-[13px] font-medium tabular-nums text-foreground">
                      {formatNumber(entry.chargedCredit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3 text-[13px] text-muted-foreground">
            <span>{t("token.log.page", { page: logPage, pages: logPages })}</span>
            <button
              type="button"
              disabled={logPage <= 1}
              onClick={() => setLogPage((page) => Math.max(1, page - 1))}
              className="h-8 cursor-pointer rounded-lg border px-3 text-normal transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("token.log.prev")}
            </button>
            <button
              type="button"
              disabled={logPage >= logPages}
              onClick={() => setLogPage((page) => page + 1)}
              className="h-8 cursor-pointer rounded-lg border px-3 text-normal transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("token.log.next")}
            </button>
          </div>
        </>
      )}

      <div className="mt-16 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t("adminTitle")}</h2>
        <span className="text-[13px] text-muted-foreground">
          {t("people", { count: usageAccounts.length })}
        </span>
      </div>

      {isAccountsLoading ? (
        <p className={noteClass}>{t("account.loading")}</p>
      ) : isAccountsError ? (
        <p className={noteClass}>
          {t("account.error", { message: getApiErrorMessage(accountsError) })}
        </p>
      ) : usageAccounts.length === 0 ? (
        <p className={noteClass}>{t("account.empty")}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b text-xs font-medium text-muted-foreground">
                <th className="py-2.5 pr-4 font-medium">{t("table.admin")}</th>
                <th className="py-2.5 pr-4 font-medium">{t("table.status")}</th>
                <th className="w-[38%] py-2.5 pr-4 font-medium">{t("table.aiCredit")}</th>
                <th className="py-2.5 text-right font-medium">{t("table.accountStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {usageAccounts.map((account) => (
                <AdminRow key={account.id} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
};

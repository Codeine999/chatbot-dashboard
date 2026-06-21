import {
  Bot,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Users,
  WalletCards,
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
import { useLineOaCredits } from "./hooks/useLineOaCredits";
import type { CreditUsageItem } from "./services/usage.service";

type UsageAccount = {
  id: string;
  name: string;
  status: "active" | "trial" | "inactive";
  chatCreditUsed: number;
  chatCreditLimit: number;
  aiCreditUsed: number;
  aiCreditLimit: number;
};

const baseUsageAccounts: UsageAccount[] = [
  {
    id: "line-oa",
    name: "Line OA Account",
    status: "active",
    chatCreditUsed: 225,
    chatCreditLimit: 3000,
    aiCreditUsed: 332,
    aiCreditLimit: 1000,
  },
  {
    id: "my-account",
    name: "My Account",
    status: "trial",
    chatCreditUsed: 0,
    chatCreditLimit: 3000,
    aiCreditUsed: 0,
    aiCreditLimit: 1000,
  },
];

const formatNumber = (value: number) => value.toLocaleString();

const getPercent = (used: number, limit: number) =>
  limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

const statusStyle: Record<UsageAccount["status"], string> = {
  active: "bg-green-50 text-green-700 ring-green-200",
  trial: "bg-amber-50 text-amber-700 ring-amber-200",
  inactive: "bg-slate-100 text-slate-500 ring-slate-200",
};

const statusLabel: Record<UsageAccount["status"], string> = {
  active: "Active",
  trial: "Trial",
  inactive: "Inactive",
};

const findCreditByType = (credits: CreditUsageItem[], type: string) =>
  credits.find((item) => item.type.toUpperCase().startsWith(type));

function StatusBadge({ status }: { status: UsageAccount["status"] }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyle[status]}`}>
      {statusLabel[status]}
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
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
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
  const percent = getPercent(used, limit);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatNumber(used)} / {formatNumber(limit)} credits
          </p>
        </div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {percent}%
        </span>
      </div>
      <ProgressBar value={percent} color={color} />
    </div>
  );
}

function AccountUsageCard({ account }: { account: UsageAccount }) {
  const initials = account.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <Card className="group border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border border-slate-200 bg-gradient-to-br from-green-50 to-blue-50">
              <AvatarFallback className="bg-transparent text-sm font-semibold text-slate-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base text-slate-900">{account.name}</CardTitle>
              <CardDescription className="mt-1 whitespace-normal text-xs">
                LINE OA usage and AI response credits
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={account.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5">
        <CreditUsageRow
          label="Chat credit usage"
          used={account.chatCreditUsed}
          limit={account.chatCreditLimit}
          color="bg-blue-500"
        />
        <CreditUsageRow
          label="AI credit usage"
          used={account.aiCreditUsed}
          limit={account.aiCreditLimit}
          color="bg-orange-500"
        />

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          <span>Account health</span>
          <span className="flex items-center gap-1.5 font-semibold text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Operational
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export const Usage = () => {
  const { data: lineOaCredits = [], isLoading, isError } = useLineOaCredits();
  const lineMessageCredit = findCreditByType(lineOaCredits, "LINE_MESSAG");

  const usageAccounts = baseUsageAccounts.map((account) => {
    if (account.id !== "line-oa" || !lineMessageCredit) return account;

    return {
      ...account,
      chatCreditUsed: lineMessageCredit.usedTotal,
      chatCreditLimit: lineMessageCredit.balance,
    };
  });

  const totalChatUsed = lineMessageCredit?.usedTotal ?? usageAccounts[0].chatCreditUsed;
  const totalAiUsed = usageAccounts.reduce((total, item) => total + item.aiCreditUsed, 0);
  const totalAiLimit = usageAccounts.reduce((total, item) => total + item.aiCreditLimit, 0);
  const activeAccounts = usageAccounts.filter((item) => item.status === "active").length;
  const remainingAiCredits = totalAiLimit - totalAiUsed;

  const summaryCards = [
    {
      title: "Total Chat Credits Used",
      value: isLoading ? "Loading..." : formatNumber(totalChatUsed),
      helper: lineMessageCredit
        ? `LINE_MESSAGE balance ${formatNumber(lineMessageCredit.balance)}`
        : "Across all connected accounts",
      icon: MessageCircle,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total AI Credits Used",
      value: formatNumber(totalAiUsed),
      helper: "AI responses generated",
      icon: Bot,
      accent: "bg-orange-50 text-orange-600",
    },
    {
      title: "Active Accounts",
      value: String(activeAccounts),
      helper: `${usageAccounts.length} accounts configured`,
      icon: Users,
      accent: "bg-green-50 text-green-600",
    },
    {
      title: "Remaining AI Credits",
      value: formatNumber(remainingAiCredits),
      helper: `From ${formatNumber(totalAiLimit)} total credits`,
      icon: WalletCards,
      accent: "bg-slate-100 text-slate-600",
    },
  ];

  return (
    <div className="mt-10 2xl:px-28 max-w-8xl mx-auto mb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Usage</h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor your LINE OA account, chat credit, and AI credit usage.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-orange-500" />
          {isLoading ? "Syncing credits..." : isError ? "Using fallback data" : "Updated just now"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.title} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${item.accent}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {usageAccounts.map((account) => (
          <AccountUsageCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
};

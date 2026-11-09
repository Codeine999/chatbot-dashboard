import {
    Card,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

import {
    Users,
    User,
    MessageSquare,
    Gauge,
} from "lucide-react";

import {
    useLineOaFollowers,
    useLineOaMessageUsage,
} from "../hooks/useLineOaDashboard";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

const OverviewCard = () => {
    const { t } = useTranslation("home");
    const followers = useLineOaFollowers();
    const messageUsage = useLineOaMessageUsage();

    const followerDelta = followers.data?.changePercent ?? null;

    const cards = [
        {
            id: "followers",
            accent: "text-blue-500",
            iconTone: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
            points: [4, 5, 4.5, 6, 5, 7, 6.5, 8, 7, 9],
            title: t("overview.followers"),
            icon: Users,
            loading: followers.isLoading,
            total: followers.data?.followers ?? null,
            description:
                followerDelta === null ? (
                    t("overview.followersNoHistory")
                ) : (
                    <>
                        <span
                            className={
                                followerDelta >= 0 ? "text-green-600" : "text-red-600"
                            }
                        >
                            {followerDelta >= 0 ? "+" : ""}
                            {followerDelta}%
                        </span>{" "}
                        {t("overview.followersDelta")}
                    </>
                ),
        },
        {
            id: "messages-sent",
            accent: "text-violet-500",
            iconTone: "border border-border bg-transparent text-icons dark:border-transparent",
            points: [3, 4, 3.5, 5, 7, 5.5, 6, 9, 6.5, 8],
            title: t("overview.messagesSent"),
            icon: MessageSquare,
            loading: messageUsage.isLoading,
            total: messageUsage.data?.sentThisMonth.count ?? null,
            description: messageUsage.data
                ? t("overview.messagesPeriod", {
                      period: messageUsage.data.sentThisMonth.period,
                  })
                : "",
        },
        {
            id: "quota-used",
            accent: "text-emerald-500",
            iconTone: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
            points: [2, 3, 3, 4.5, 4, 6, 8, 7, 9, 10],
            title: t("overview.quotaUsed"),
            icon: Gauge,
            loading: messageUsage.isLoading,
            total: messageUsage.data?.quotaUsed ?? null,
            description: t("overview.thisMonth"),
        },
        {
            id: "active-now",
            accent: "text-orange-500",
            iconTone: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
            points: [5, 4, 5.5, 5, 6.5, 6, 7, 8, 7.5, 10],
            title: t("overview.activeNow"),
            icon: User,
            loading: false,
            total: 0,
            description: (
                <>
                    <span className="text-green-600 mr-1">+0%</span>
                    {t("overview.fromLastMonth")}
                </>
            ),
        },
    ];

    return (
        <>
            {cards.map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.id} className="relative overflow-hidden p-4 md:max-xl:flex md:max-xl:flex-col md:max-xl:gap-3">
                        <div className="flex items-start gap-3">
                            <div
                                className={cn(
                                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                                    item.iconTone
                                )}
                            >
                                <Icon className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle>{item.title}</CardTitle>
                                <p className="mt-1 text-xl font-semibold">
                                    {item.loading || item.total === null
                                        ? "—"
                                        : formatNumber(item.total)}
                                </p>
                                <CardDescription className="mt-1">
                                    {item.description}
                                </CardDescription>
                            </div>
                        </div>
                        <Sparkline
                            points={item.points}
                            className={cn(
                                "pointer-events-none absolute bottom-3 right-3 h-12 w-28 md:max-xl:static md:max-xl:h-10 md:max-xl:w-full",
                                item.accent
                            )}
                        />
                    </Card>
                );
            })}
        </>
    )
}

export default OverviewCard

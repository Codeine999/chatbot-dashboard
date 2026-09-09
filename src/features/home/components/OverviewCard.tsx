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

const OverviewCard = () => {
    const { t } = useTranslation("home");
    const followers = useLineOaFollowers();
    const messageUsage = useLineOaMessageUsage();

    const followerDelta = followers.data?.changePercent ?? null;

    const cards = [
        {
            id: "followers",
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
            title: t("overview.quotaUsed"),
            icon: Gauge,
            loading: messageUsage.isLoading,
            total: messageUsage.data?.quotaUsed ?? null,
            description: t("overview.thisMonth"),
        },
        {
            id: "active-now",
            title: t("overview.activeNow"),
            icon: User,
            loading: false,
            total: 573,
            description: (
                <>
                    <span className="text-green-600 mr-1">+20.1%</span>
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
                    <Card key={item.id} className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <CardTitle>{item.title}</CardTitle>
                                <p className="mt-1 text-xl font-medium">
                                    {item.loading || item.total === null
                                        ? "—"
                                        : formatNumber(item.total)}
                                </p>
                                <CardDescription className="mt-1">
                                    {item.description}
                                </CardDescription>
                            </div>
                            <Icon className="mt-1 w-5 h-5 text-icons" />
                        </div>
                    </Card>
                );
            })}
        </>
    )
}

export default OverviewCard

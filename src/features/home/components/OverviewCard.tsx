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

const OverviewCard = () => {
    const followers = useLineOaFollowers();
    const messageUsage = useLineOaMessageUsage();

    const followerDelta = followers.data?.changePercent ?? null;

    const cards = [
        {
            id: "followers",
            title: "Followers",
            icon: Users,
            loading: followers.isLoading,
            total: followers.data?.followers ?? null,
            description:
                followerDelta === null ? (
                    "not enough history yet"
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
                        last 7 days
                    </>
                ),
        },
        {
            id: "messages-sent",
            title: "Messages Sent",
            icon: MessageSquare,
            loading: messageUsage.isLoading,
            total: messageUsage.data?.sentThisMonth.count ?? null,
            description: messageUsage.data
                ? `in ${messageUsage.data.sentThisMonth.period}`
                : "",
        },
        {
            id: "quota-used",
            title: "Message Quota Used",
            icon: Gauge,
            loading: messageUsage.isLoading,
            total: messageUsage.data?.quotaUsed ?? null,
            description: "this month",
        },
        {
            id: "active-now",
            title: "Active now",
            icon: User,
            loading: false,
            total: 573,
            description: (
                <>
                    <span className="text-green-600 mr-1">+20.1%</span>
                    from last month
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
                                        : item.total.toLocaleString()}
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

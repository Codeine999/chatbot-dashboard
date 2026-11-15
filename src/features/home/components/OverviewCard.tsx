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
            flat: false,
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            points: [26, 22, 24, 17, 21, 12, 15, 8, 11, 3],
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            iconColor: "text-[#8b5cf6]",
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
                                followerDelta >= 0 ? "font-semibold text-green-700" : "font-semibold text-red-600"
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
            flat: false,
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            points: [28, 24, 26, 18, 12, 16, 14, 6, 14, 9],
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            iconColor: "text-[#2563eb]",
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
            flat: false,
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            points: [28, 26, 27, 22, 23, 16, 10, 13, 7, 5],
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            iconColor: "text-[#ea580c]",
            title: t("overview.quotaUsed"),
            icon: Gauge,
            loading: messageUsage.isLoading,
            total: messageUsage.data?.quotaUsed ?? null,
            description: t("overview.thisMonth"),
        },
        {
            id: "active-now",
            points: [] as number[],
            flat: true,
            // เส้นตกแต่งเท่านั้น ไม่ใช่ข้อมูลจริง
            iconColor: "text-[#16a34a]",
            title: t("overview.activeNow"),
            icon: User,
            loading: false,
            total: 0,
            description: (
                <>
                    <span className="mr-1 font-semibold text-normal">0%</span>
                    {t("overview.fromLastMonth")}
                </>
            ),
        },
    ];

    return (
        <>
            {cards.map((item, index) => {
                const Icon = item.icon;
                const empty = item.loading || item.total === null;
                return (
                    <div
                        key={item.id}
                        className={cn(
                            "flex flex-col gap-2.5 py-0.5",
                            // เส้นคั่นแนวตั้งระหว่างช่อง ช่องแรกชิดซ้าย ช่องสุดท้ายชิดขวา
                            index === 0 ? "pr-7" : "border-l px-7",
                            index === cards.length - 1 && "pr-0"
                        )}
                    >
                        <span className="flex items-center gap-2 text-[15px] text-normal">
                            <Icon className={cn("size-4 shrink-0", item.iconColor)} strokeWidth={1.7} />
                            <span className="truncate">{item.title}</span>
                        </span>
                        <div className="flex items-end justify-between gap-4">
                            <span
                                className={cn(
                                    "text-[28px] font-semibold leading-none tracking-[-0.025em] tabular-nums",
                                    empty ? "text-[#b5b0aa]" : "text-foreground"
                                )}
                            >
                                {empty ? "—" : formatNumber(item.total as number)}
                            </span>
                            <Sparkline
                                flat={item.flat}
                                points={item.points}
                                className={cn("pointer-events-none h-7 w-[88px] shrink-0", item.iconColor)}
                            />
                        </div>
                        <span className="text-[13px] text-muted-foreground">{item.description}</span>
                    </div>
                );
            })}
        </>
    )
}

export default OverviewCard

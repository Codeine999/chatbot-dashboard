import {
    Card,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

import {
    Wallet,
    User,
    CreditCard,
    ChartSpline,
} from "lucide-react";


const overviewData = [
    { id: "1", title: "Total Revenue", total: 45231, icon: Wallet },
    { id: "2", title: "Subscriptions", total: 2350, icon: CreditCard },
    { id: "3", title: "Sales", total: 12234, icon: ChartSpline },
    { id: "4", title: "Active now", total: 573, icon: User },
]

const OverviewCard = () => {
    return (
        <>
            {overviewData.map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.id} className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <CardTitle>{item.title}</CardTitle>
                                <p className="mt-1 text-xl font-medium">{item.total}</p>
                                <CardDescription className="mt-1">
                                    <span className="text-green-600 mr-1">
                                        +20.1%
                                    </span>
                                    from last month
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
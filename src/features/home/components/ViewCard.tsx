import React from "react";
import {
    Card,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    ChevronDown,
} from "lucide-react"

import ViewChart from "@/components/widgets/ViewChart";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const ViewCard = () => {
    const { t } = useTranslation("home");
    // value ต้องคงเดิม เพราะ ViewChart ใช้เทียบกับ label ในชุดข้อมูล
    const [viewPosition, setViewPosition] = React.useState("Weekly")
    return (
        <Card>
            <div className="p-6 px-6">
                <div className="flex justify-between">
                    <CardTitle>{t("views.title", { period: t(`money.${viewPosition.toLowerCase()}`) })}</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <span className="flex items-center text-normal text-sm">
                                    {t(`money.${viewPosition.toLowerCase()}`)}
                                    <ChevronDown className="!w-5 !h-4" />
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44 p-2">
                            <DropdownMenuRadioGroup value={viewPosition} onValueChange={setViewPosition}>
                                <DropdownMenuRadioItem value="Weekly">{t("money.weekly")}</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Monthly">{t("money.monthly")}</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Yearly">{t("money.yearly")}</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <ViewChart selected={viewPosition} />
        </Card>
    )
}

export default ViewCard
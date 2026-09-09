import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";

import {
    ChevronDown,
} from "lucide-react"

import MoneyChart from '@/components/widgets/MoneyChart';
import { useTranslation } from "react-i18next";


const MoneyCard = () => {
    const { t } = useTranslation("home");
    // value ต้องคงเดิม เพราะ MoneyChart ใช้เทียบกับ label ใน weekmoneyData
    const [position, setPosition] = React.useState("Weekly")
    return (
        <Card className="p-6">
            <div className="flex justify-between">
                <CardTitle>{t("money.title", { period: t(`money.${position.toLowerCase()}`) })}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            <span className="flex items-center text-normal text-sm">
                                {t(`money.${position.toLowerCase()}`)}
                                <ChevronDown className="!w-5 !h-4" />
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44 p-2">
                        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                            <DropdownMenuRadioItem value="Weekly">{t("money.weekly")}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Monthly">{t("money.monthly")}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Yearly">{t("money.yearly")}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <MoneyChart selected={position} />
        </Card>
    )
}

export default MoneyCard

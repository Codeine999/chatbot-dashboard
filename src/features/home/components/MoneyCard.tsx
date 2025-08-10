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


const MoneyCard = () => {
    const [position, setPosition] = React.useState("Weekly")
    return (
        <Card className="p-6">
            <div className="flex justify-between">
                <CardTitle>{position} Money</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            <span className="flex items-center text-normal text-sm">
                                {position}
                                <ChevronDown className="!w-5 !h-4" />
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44 p-2">
                        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                            <DropdownMenuRadioItem value="Weekly">Weekly</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Monthly">Monthly</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Yearly">Yearly</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <MoneyChart selected={position} />
        </Card>
    )
}

export default MoneyCard
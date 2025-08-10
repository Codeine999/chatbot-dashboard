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

const ViewCard = () => {
    const [viewPosition, setViewPosition] = React.useState("Weekly")
    return (
        <Card>
            <div className="p-6 px-6">
                <div className="flex justify-between">
                    <CardTitle>{viewPosition} Views</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <span className="flex items-center text-normal text-sm">
                                    {viewPosition}
                                    <ChevronDown className="!w-5 !h-4" />
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44 p-2">
                            <DropdownMenuRadioGroup value={viewPosition} onValueChange={setViewPosition}>
                                <DropdownMenuRadioItem value="Weekly">Weekly</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Monthly">Monthly</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Yearly">Yearly</DropdownMenuRadioItem>
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
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
    MessageSquare,
    Copy,
} from 'lucide-react';

const ConfirmOrderCustomer = () => {
    return (
        <Card className="lg:mt-4 mt-2 w-full h-[444px] border-t-4 border-t-[#8a9bfa]">

            <div className="p-4 border-b">
                <CardTitle>Customer</CardTitle>
                <CardDescription>Infomation Detail</CardDescription>
            </div>

            <div className="px-6 mt-4 border-b h-15">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="bg-gray-600 w-10 h-10 rounded-full" />
                        <div className="flex flex-col mt-1 justify-center">
                            <p className="md:text-[15px] text-sm">Test User</p>
                            <p className="text-xs text-normal">Petunda911@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="ghost">
                            <MessageSquare className="!w-5 !h-5 text-normal" />
                        </Button>
                    </div>
                </div>
            </div>


            <div className="p-6 pt-2">

                <div className="h-22 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle>Contact</CardTitle>
                        <Button variant="ghost" className="text-xs text-normal">
                            <Copy />
                        </Button>
                    </div>

                    <div className="px-5">
                        <div className="flex gap-2">
                            <p className="text-sm text-normal">Petunda</p>
                            <p className="text-sm text-normal">Paksa</p>
                        </div>
                        <p className="text-normal text-sm">0988323099</p>
                    </div>
                </div>

                <div className="pt-2 h-24 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle>Shipping Adress</CardTitle>
                        <Button variant="ghost" className="text-xs text-normal">
                            <Copy />
                        </Button>
                    </div>
                    <div className="mx-2 w-[200px]">
                        <p className="text-sm text-normal">22/66 mock-up address my, bangkok 13432</p>
                    </div>
                </div>

                <div className="pt-4 h-22">
                    <div className="flex justify-between items-center">
                        <CardTitle>Tracking Package</CardTitle>
                    </div>

                    <div className="mt-2 mx-2">
                        <div className="flex justify-between">
                            <p className="text-sm">Kerry: XSD-3333333</p>
                            <span>file</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ConfirmOrderCustomer
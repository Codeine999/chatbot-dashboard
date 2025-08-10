import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Download,

} from 'lucide-react';

const ConfirmOrderPayments = () => {
    return (
        <Card className="w-full lg:h-[250px] h-[300px]">
            <div className="p-4">
                <div className="flex justify-between">
                    <div>
                        <CardTitle>Payments </CardTitle>
                        <CardDescription>overview details</CardDescription>
                    </div>
                    <div className="flex ml-auto items-center gap-2">
                        <Download className="w-4 h-5 text-[#7794ca]" />
                        <button className="text-xs text-mini cursor-pointer"> invoice</button>
                    </div>
                </div>
            </div>

            <div className="px-4">
                <div className=" w-full rounded-lg">
                    <div className="flex flex-col lg:gap-2 gap-4">
                        <div className="flex justify-between">
                            <div className="text-sm text-normal">
                                Subtotal
                            </div>
                            <div className="text-sm">
                                ฿13900
                            </div>
                        </div>

                        <div className="flex justify-between text-normal">
                            <div className="text-sm">
                                Discount
                            </div>
                            <div className="text-sm text-green-600">
                                -฿350
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-sm text-normal">
                                Shipping
                            </div>
                            <div className="text-sm">
                                ฿100
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-normal">
                                Payment Method
                            </div>
                            {/* text-[#683acd] */}

                            <div className="bg-gray-100 -mx-2 rounded-2xl">
                                <span className="text-sm px-3">sprits</span>
                            </div>
                        </div>
                        <div className="border-1 w-full 3xl:mt-[8px] mt-2 mb-1" />

                        <div className="flex justify-between">
                            <p className="text-md font-medium">
                                Total
                            </p>
                            <p className="text-md font-medium">
                                ฿14,500
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </Card>
    )
}

export default ConfirmOrderPayments
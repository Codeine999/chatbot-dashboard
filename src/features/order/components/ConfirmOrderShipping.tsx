import { useState, useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import {
    Clock,
    ChevronDown,
    Layers2,
    CreditCard,
    PackageSearch,
    Truck,
    Ban,

} from 'lucide-react';
import { Button } from "@/components/ui/button";



const steps = ["Order ", "Payment", "Processing", "Shipping"];
const icons = [
    <Layers2 className="text-[28px] text-[#603de1]" />,
    <CreditCard className="text-[28px] text-[#603de1]" />,
    <PackageSearch className="text-[28px] text-[#603de1]" />,
    <Truck className="text-[28px] text-[#603de1]" />,
];


const ConfirmOrderShipping = () => {
    const [status, setStatus] = useState('Pending');
    const [progress, setProgress] = useState([0, 0, 0, 0]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleChangeStatus = (newStatus) => {
        setStatus(newStatus);  // เปลี่ยนสถานะตามที่ผู้ใช้เลือก
    };


    useEffect(() => {
        if (progress[currentIndex] < 100) {
            const timer = setTimeout(() => {
                setProgress((prevProgress) => {
                    const newProgress = [...prevProgress];
                    newProgress[currentIndex] += 20;
                    return newProgress;
                });
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            if (currentIndex < steps.length - 1) {
                setTimeout(() => {
                    setCurrentIndex(currentIndex + 1);
                }, 500);
            }
        }
    }, [progress, currentIndex]);


    return (
        <Card className="md:h-[200px] w-full">
            <div className='p-4'>
                <div className="flex justify-between">
                    <div className="">
                        <CardTitle>Process</CardTitle>
                        <CardDescription>Check items already to shipping</CardDescription>
                    </div>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>

                                <Button variant="ghost" className="text-normal">
                                    {status}
                                    <ChevronDown className="w-4 h-4" />
                                </Button>

                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onClick={() => handleChangeStatus('Pending')}
                                        className={status === 'Pending' ? '' : 'text-gray-700'}
                                    >
                                        <Clock /> Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleChangeStatus('Paid')}
                                        className={status === 'Paid' ? 'text-blue-gray-500' : 'text-gray-700'}
                                    >
                                        <CreditCard />Paid
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleChangeStatus('Cancell Order')}
                                        className="text-gray-700"
                                    >
                                        <Ban />Cancell Order
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className='mt-2 md:px-6'>
                    <div className='bg-inside w-full h-[100px] rounded-lg'>

                        <div className='p-2 flex justify-center md:gap-4 gap-2'>
                            {steps.map((label, index) => (
                                <div key={index} className='bg-background w-[130px] h-[84px] rounded-lg shadow-sm'>
                                    <div className='mt-2 px-2'>
                                        {icons[index]}
                                        <p className='2xl:text-sm text-xs mt-1.5'>{label}</p>
                                        <div
                                            className="h-1 mt-2 bg-green-500 rounded-full transition-all duration-1000 ease-in-out"
                                            style={{ width: `${progress[index]}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ConfirmOrderShipping
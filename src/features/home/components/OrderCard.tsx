import { useState, useEffect } from "react";
import {
    CardContent,
    CardTitle,
    CardDescription,
    CardHeader,
    Card,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    SquarePen,
    Ellipsis,
} from "lucide-react";
import { getOrder } from "@/features/home/services/getOrder";
import { Link } from 'react-router-dom';



const OrderCard = () => {
    return (
        <div>

        </div>
    )
}


const Order = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        async function fetchOrders() {
            const orders = await getOrder();
            setOrders(orders);
            console.log(orders)
        }
        fetchOrders();
    }, []);

    return (
        <Card className="p-6 overflow-auto h-[384px]">

            <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>You made 265 sales this month.</CardDescription>
                </div>
                <Button variant="ghost">
                    <Ellipsis className="!w-5 !h-5 text-normal"  />
                </Button>
            </div>

            <Table className="w-full table-fixed">
                <TableHeader className="h-[50px] border-b">
                    <TableRow>
                        <TableHead className="lg:w-[50px] w-[50px] lg:text-sm text-xs text-mini font-medium  ">Profile</TableHead>
                        <TableHead className="lg:w-[50px] w-[60px] lg:text-sm text-xs text-mini font-medium">Users</TableHead>
                        <TableHead className="lg:w-[60px] w-[70px] lg:text-sm text-xs text-mini font-medium">Status</TableHead>
                        <TableHead className="lg:w-[50px] w-[50px] lg:text-sm text-xs text-mini font-medium">Total</TableHead>
                        <TableHead className="lg:w-[40px] w-[50px] lg:text-sm text-xs text-mini font-medium">Edit</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.map((items) => (
                        <TableRow key={items._id} className="text-xs">
                            <TableCell className="w-[50px]">
                                <div className="lg:w-10 lg:h-10 w-8 h-8 rounded-full bg-gray-500">

                                </div>

                            </TableCell>
                            <TableCell className="w-[60px]">
                                {items.customer.username}
                            </TableCell>
                            <TableCell className="w-[60px]">
                                {items.status}
                            </TableCell>
                            <TableCell className="w-[60px] text-green-600">
                                {items.total}
                            </TableCell>
                            <TableCell className="w-[40px]">
                                <Link to={`/order/confirm/${items._id}`}>
                                    <Button variant="ghost" className="text-yellow-500 p-0">
                                        <SquarePen className="!w-5 !h-5" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </Card>
    )
}

export default Order
import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    CardHeader,
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
import {
    ChevronRight,
    ChevronLeft,
    Trash2,
    Package,
    Tag,
    Hash
} from 'lucide-react';


const ConfirmOrderTable = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = products.slice(startIndex, startIndex + itemsPerPage)

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <Card className="w-full md:h-[520px] h-[598px] lg:mt-[-30px] mt-4 relative">

            <div className="relative rounded-lg md:h-[446px] h-[545px]">
                <div className="p-4 flex gap-2 items-center border-b">
                    <Package className="w-5 h-5 text-normal" />
                    <CardTitle>Products </CardTitle>
                    <Button variant="items" className="text-[11px]">12 items</Button>
                </div>

                <Table className="mt-2 w-full table-fixed text-sm">
                    {currentItems.map((product, index) => (
                        <TableRow key={index} className="border-b py-0.5">
                            <div className="flex justify-between">
                                <TableCell className="p-1 px-6 flex">
                                    <img
                                        src={product.img}
                                        alt={product.name}
                                        className="md:mt-2 mt-6 w-[50px] h-[45px] object-contain"
                                    />
                                    <div className="mt-1 mx-4">
                                        <p className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight text-xs">
                                            {product.name}
                                        </p>
                                        <div className="flex gap-4">
                                            <div className="text-xs text-normal flex items-center">
                                                <Hash className="w-3 h-3" />
                                                <p>sku-01vdvdes</p>
                                            </div>
                                            <div className="flex gap-1 text-xs items-center">
                                                <Tag className="w-3 h-3" />
                                                <p>size:</p>
                                                <div className="border rounded-sm px-3">
                                                    <span>xs</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 text-xs items-center">
                                                <p>Qty:</p>
                                                <div className="border rounded-sm px-3">
                                                    <span>1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <div className="md:px-6 px-10 flex">
                                    <div className="flex items-center gap-6">
                                        <p className="text-sm text-normal font-medium whitespace-nowrap">
                                            ฿ 16,200
                                        </p>
                                        <Button
                                            variant="ghost"
                                            // onClick={() => handleDelete(items)}
                                            className="cursor-pointer text-red-400"
                                        >
                                            <Trash2 className="!w-5 !h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TableRow>
                    ))}
                </Table>
            </div>

            <div className="flex justify-end items-center px-4 md:mt-6">
                <div className="flex">
                    <Button
                        variant="ghost"
                        onClick={prevPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="!w-10 !h-5 text-[#667085]" />
                    </Button>
                    <div className="mt-1.5 bg-background border-[0.5px] w-[60px] h-[26px] rounded-full mx-2 shadow-xs">
                        <span className="ml-4.5 text-[12px]">
                            {currentPage} / {totalPages}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={nextPage}
                        disabled={currentPage === totalPages}

                    >
                        <ChevronRight className="!w-10 !h-5 text-[#667085]" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default ConfirmOrderTable






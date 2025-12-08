import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderList } from "@/data/order.data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
  Card,
} from "@/components/ui/card"

import {
  RotateCcw,
  Trash2,
  Star,
  Ellipsis,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  SquareMousePointer,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { getOrder } from "../home/services/getOrder";

const order = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [rawOrder, setRawOrder] = useState(orderList);
  const [currentPage, setCurrentPage] = useState(1);
  const [position, setPosition] = React.useState("All")
  const [orders, setOrders] = useState<any[]>([]);
  const itemsPerPage = 10;

  const filteredOrder = position === "All"
    ? rawOrder
    : rawOrder.filter((item) => item.status === position);

  const totalPages = Math.ceil(filteredOrder.length / itemsPerPage) || 1;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setRawOrder(orderList);
  }, [orderList]);

  
  useEffect(() => {
    async function fetchOrders() {
      const res = await getOrder();
      console.log(res)
      setOrders(res.data ?? []);
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [position]);


  const maxLength = () => {
    if (windowWidth < 400) return 90;
    if (windowWidth >= 700 && windowWidth <= 1200) return 120;
    return 120;
  };

  const cutText = (text, maxLength) =>
    text.length <= maxLength ? text : text.slice(0, maxLength) + "..";

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


  const currentItems = filteredOrder.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mt-6">
      <SearchBar />
      <Card className="mt-4 flex flex-col w-full mb-5 lg:h-[680px] h-[735px]">

        {/* Header: Filter + Search */}
        <div className="flex justify-between p-4">
          <div className="flex gap-4">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <span className="flex items-center text-lg gap-1 text-gray-500">
                      <SquareMousePointer className="!w-5 !h-5 " />
                      <ChevronDown className="!w-5 !h-5" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44 p-2">
                  <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                    <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Paid">Paid</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Cancel">Cancel</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


          <div>
            <div className="flex items-center">
              <div className="flex items-center">
                <Sheet>
                  <Button variant="ghost">
                    <Trash2 className="!w-5 !h-5 text-red-400 cursor-pointer" />
                  </Button>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <Ellipsis className="text-[#667085]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mt-2  w-50">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>shipping</DropdownMenuItem>
                      <DropdownMenuItem>success</DropdownMenuItem>
                      <DropdownMenuItem>cancel</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full border-t" />

        {/* Scrollable Order List */}
        <div className="flex-1 overflow-y-auto">
          {orderList.map(item => (
            <Link key={item.orderID} to={`/order/confirm/${item.orderID}`}>
              <div className="flex justify-center items-center gap-2 p-4 -my-[1.2px] hover:bg-[#f1f3f9]">
                <div className="mr-auto flex md:gap-6 gap-2 items-center">
                  <div className="xl:w-[140px] lg:w-[140px] w-[130px]">
                    <div className="flex gap-6 items-center">
                      <Checkbox id="terms" />
                      <p className="text-md text-normal">
                      {cutText(item.name ?? "", maxLength())}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-5 whitespace-nowrap 2xl:w-[900px] mx-a xl:w-[700px] lg:w-[600px] w-[450px]">
                  <p className="text-sm text-normal">
                    {cutText(item.detail ?? "", maxLength())}
                  </p>
                  <Button
                    className={cn(
                      "px-3 h-[20px] rounded-3xl text-xs text-white",
                      item.status === "Paid" && "bg-gray-300 text-gray-500 font-normal",
                      item.status === "Pending" && "bg-blue-100 text-blue-500 font-normal",
                      item.status === "Cancel" && "bg-red-100 text-red-600 font-normal"
                    )}
                  >
                    {item.status}
                  </Button>
                </div>

                <div className="ml-auto">
                  <p className="text-sm text-normal">{item.time}</p>
                </div>
              </div>
              <div className="w-full border-b" />
            </Link>
          ))}
        </div>

        {/* Pagination fixed to bottom */}
        <div className="md:block hidden px-4 py-3">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="!w-10 !h-5" />
            </Button>

            <div className="border px-5 rounded-full">
              <span className="text-xs">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="!w-10 !h-5" />
            </Button>
          </div>
        </div>


        <div className="md:hidden block overflow-y-auto h-[656px]">
          {currentItems.map((items) => (
            <Link to={`/order/confirm/${items.orderID}`} key={items.orderID}>
              <div className="flex justify-center items-center gap-2 p-4">
                <div className="mr-auto flex gap-4 items-center">
                  <Checkbox id="terms" />
                  <div className="flex flex-col">
                    <div className="flex gap-4">
                      <p className="text-sm text-color font-bold">
                        {cutText(items.name, maxLength())}
                      </p>
                      <Button
                        className={cn(
                          "px-2 h-[18px] rounded-full text-xs text-white",
                          items.status === "Paid" && "bg-gray-400",
                          items.status === "Pending" && "bg-[#6d88f3]",
                          items.status === "Cancel" && "bg-[#fe8080]"
                        )}
                      >
                        {items.status}
                      </Button>
                    </div>
                    <p className="text-xs text-normal md:w-full w-[230px]">
                      {cutText(items.detail, maxLength())}
                    </p>
                  </div>
                </div>

                <div className="md:block hidden mr-auto">
                  <h1 className="text-sm text-gray-500">Status</h1>
                </div>

                <div className="-mt-1">
                  <p className="text-sm mb-1 text-gray-500">{items.time}</p>
                </div>
              </div>
              <div className="-mt-1 w-full border-1" />
            </Link>
          ))}
        </div>

        <div className="block md:hidden">
          <div className="flex justify-between -mt-1 p-2 px-4">
            <p className="text-sm">showing 1 of 88</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default order;

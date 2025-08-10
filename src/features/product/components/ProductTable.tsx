import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  CirclePlus,
  CircleMinus,
  SquarePen,
  ChevronRight,
  ChevronLeft,
  Trash2
} from "lucide-react";

import { http } from "@/lib/http";
import { Link } from "react-router-dom";


interface ProductTableProps {
  products: any[];
}


const ProductTable = ({ products }: ProductTableProps) => {

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentItems, setCurrentItems] = useState([]);
  const [productStatus, setProductStatus] = useState({});
  const itemsPerPage = 7;


  const [productStock, setProductStock] = useState({});

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(products.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, products]);

  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;


  const handleStockChange = (id, newValue) => {
    const parsedValue = Number(newValue);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setProductStock((prevStock) => ({
        ...prevStock,
        [id]: parsedValue,
      }));
    }
  };

  const handleStatusChange = (id, newValue) => {
    setProductStatus((prevStatus) => ({
      ...prevStatus,
      [id]: newValue.charAt(0).toUpperCase() + newValue.slice(1),
    }));
  };


  const handleIncrease = (id) => {
    setProductStock((prevStock) => ({
      ...prevStock,
      [id]: (Number(prevStock[id]) || 0) + 1,
    }));
  };

  const handleDecrease = (id) => {
    setProductStock((prevStock) => ({
      ...prevStock,
      [id]: Math.max((Number(prevStock[id]) || 0) - 1, 0),
    }));
  };


  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const maxLength = () => {
    if (windowWidth < 490) return 20;
    if (windowWidth >= 500 && windowWidth <= 1200) return 20;
    return 90;
  };

  const cutText = (text, maxLength) =>
    text.length <= maxLength ? text : text.slice(0, maxLength) + "..";

  {
    currentItems.map((item, index) => {
      console.log("ITEMS FILE:", item.files[0]);
    })
  }


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
    <Card className="mt-4 overflow-hidden">
      <div className="h-[600px]">
        <Table className="min-w-full table-fixed">
          <TableHeader className="h-[60px] border-b border">
            <TableRow>
              <TableHead className="w-[100px] px-5 text-[#879da7] font-semibold">Picture</TableHead>
              <TableHead className="w-[200px] text-[#879da7] font-semibold">Name</TableHead>
              <TableHead className="w-[150px] text-[#879da7] font-semibold">Status</TableHead>
              <TableHead className="w-[100px] text-[#879da7] font-semibold">Price</TableHead>
              <TableHead className="w-[150px] text-[#879da7] text-center font-semibold">Stock</TableHead>
              <TableHead className="w-[120px] text-[#879da7] text-center font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentItems.map((items, index) => (
              <TableRow key={items._id || `row-${index}`}>
                <TableCell className="p-3 px-5">
                  <img
                    src={`${http}/${items.files[0]}`}
                    alt={items.name}
                    className="w-[55px] h-[55px] object-contain rounded-md"
                  />
                </TableCell>
                <TableCell className="text-normal font-medium">{cutText(items.name, maxLength())}</TableCell>
                <TableCell>
                  {items.status}
                  <Select
                    value={productStatus[items.id] || items.status}
                    onValueChange={(val) => handleStatusChange(items.id, val)}
                  >
                    <SelectTrigger
                      className={`mx-5 !h-[25px] px-3 border-0 rounded-xl ${(productStatus[items.id] || items.status) === "unavailable"
                        ? "!bg-[#627c87]"
                        : "!bg-green-600"
                        }`}
                    >
                      <div className="text-white text-sm">
                        {productStatus[items.id] || items.status}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="available">available</SelectItem>
                        <SelectItem value="unavailable">unavailable</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-md text-normal font-medium">
                  ฿{items.price}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center gap-1">
                    <div className="border w-[60px] h-[25px] flex items-center justify-center rounded-sm">
                        {items.stock}
                    </div>
                    {/* <button onClick={() => handleDecrease(items.id)}>
                      <CircleMinus className="w-4.5 cursor-pointer text-mini" />
                    </button>
                    <div className="border w-[60px] h-[25px] flex items-center justify-center rounded-sm">
               
                    </div>
                    <button onClick={() => handleIncrease(items.id)}>
                      <CirclePlus className="w-4.5 cursor-pointer text-mini" />
                    </button> */}
                  </div>
                </TableCell>
                <TableCell className="text-center">

                  <Link to={`/product/edit-product/${items._id}`}>
                    <Button variant="ghost" className="text-yellow-500">
                      <SquarePen className="!w-4.5 !h-4.5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" className="text-red-400">
                    <Trash2 className="!w-4.5 !h-4.5" />
                  </Button>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5 flex justify-end items-center mb-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="!w-10 !h-5" />
          </Button>

          <div className="border px-5 rounded-full">
            <span className=" text-xs">
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
    </Card>
  )
}

export default ProductTable
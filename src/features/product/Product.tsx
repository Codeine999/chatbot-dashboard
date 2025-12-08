import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Check,
  CirclePlus,
  CircleMinus,
  SquarePen,
  ShoppingCart,
  ListFilter,
  Download,
  ChevronRight,
  ChevronLeft,
  MessageSquareWarning,
  Plus,
  ShoppingBag,
  Layers
} from "lucide-react";

import { ButtonAdd } from "@/components/Components";
import { Stock, ProductData } from "@/data/product.data";
import { useTheme } from "@/components/context/themeProvider";
import { getProducts } from "./services/getProducts";
import { http } from "@/lib/http";
import { Link } from "react-router-dom";
import ProductTable from "./components/ProductTable";
import SearchBar from "@/components/SearchBar";

const icons = [
  <ShoppingCart className="text-[30px] mt-1.5 text-[#603de1] opacity-80" />,
  <Layers className="text-[30px] mt-1.5 text-blue-500 opacity-90" />,
  <ShoppingBag className="text-[30px] mt-1.5 text-green-500 opacity-90" />,
  <MessageSquareWarning className="text-[30px] mt-1.5 text-red-600 opacity-80" />
];


const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any>([]);


  useEffect(() => {
    async function fetchProducts() {
      const product = await getProducts();
      setProducts(product);
    }

    fetchProducts();
  }, []);


  const handleAddProduct = () => {
    navigate("/product/add-product");
  };

  const handleEdit = (item: { id: string }) => {
    navigate(`/product/edit-product/${item.id}`);
  };


  return (
    <div className="mt-10 2xl:px-28 max-w-8xl mx-auto mb-12">
      <div className="flex justify-between">
        <div />
        <div className="w-[140px]">
          <ButtonAdd onClick={handleAddProduct} title={`Add Product +`} />
        </div>
      </div>

      {/* STOCK OVERVIEW */}
      <div className="mt-5 grid md:grid-cols-4 grid-cols-1 md:gap-4 gap-2">
        <Card className="h-[125px]">
          <div className="px-4 mt-3">
            <div className="bg-purple-50 w-12 h-10 rounded-md">
              <div className='flex justify-center pt-1'>
                {icons[0]}
              </div>
            </div>
            <div className="mt-4 px-4">
              <CardDescription className="-mx-2">
                Total Product
              </CardDescription>
              <p className="text-[20px]">
                {products.totalProducts}
              </p>
            </div>
          </div>
        </Card>

        <Card className="h-[125px]">
          <div className="px-4 mt-3">
            <div className="bg-blue-50 w-12 h-10 rounded-md">
              <div className='flex justify-center pt-1'>
                {icons[1]}
              </div>
            </div>
            <div className="mt-4 px-4">
              <CardDescription className="-mx-2">
                Total Stock
              </CardDescription>
              <p className="text-[20px]">
                {products.allStock}
              </p>
            </div>
          </div>
        </Card>

        <Card className="h-[125px]">
          <div className="px-4 mt-3">
            <div className="bg-green-50 w-12 h-10 rounded-md">
              <div className='flex justify-center pt-1'>
                {icons[2]}
              </div>
            </div>
            <div className="mt-4 px-4">
              <CardDescription className="-mx-2">
               Avilable Product
              </CardDescription>
              <p className="text-[20px]">
                {products.allStock}
              </p>
            </div>
          </div>
        </Card>

        <Card className="h-[125px]">
          <div className="px-4 mt-3">
            <div className="bg-red-50 w-12 h-10 rounded-md">
              <div className='flex justify-center pt-1'>
                {icons[3]}
              </div>
            </div>
            <div className="mt-4 px-4">
              <CardDescription className="-mx-2">
                Unavilable Product
              </CardDescription>
              <p className="text-[20px]">
                0
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-10 grid md:grid-cols-2 grid-cols-[70%_30%] md:gap-10">
        <SearchBar />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-24 border rounded-lg ml-auto shadow-xs">
              <div className="flex items-center gap-1 text-[#879da7]">
                Export
                <Download className="!w-4 !h-3.6" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <img
                  src="/icon/pdf.png"
                  className="w-5 h-5"
                />
                PDF
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <img
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                EXCE
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* PRODUCT TABLE */}
      <ProductTable />

    </div>
  );
};

export default Product;

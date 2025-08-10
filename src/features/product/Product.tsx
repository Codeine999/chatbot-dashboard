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
  Search,
  Plus
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
  <ShoppingCart className="text-[30px] mt-1.5 text-[#603de1]" />,
  <ShoppingCart className="text-[30px] mt-1.5 text-[#603de1]" />,
  <ShoppingCart className="text-[30px] mt-1.5 text-[#603de1]" />,
  <ShoppingCart className="text-[30px] mt-1.5 text-[#603de1]" />,
];


const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any>([]);


  useEffect(() => {
    console.log("HTTP:", http);
    async function fetchProducts() {
      const product = await getProducts();
      setProducts(product);
      console.log(product)
    }

    fetchProducts();
  }, []);

  const totalStock = products.reduce((total, products) => {
    const stockOfProduct = products.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    return total + stockOfProduct;
  }, 0);



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
        {Stock.map((item, index) => (
          <Card
            key={index}
            className="h-[125px]"
          >
            <div className="px-4 mt-3">
              <div
                className={`pt-0.5 w-[55px] h-[45px] rounded-md flex justify-center
                  border`
                }
              >
                {icons[index]}
              </div>
              <div className="mt-2 px-4">
                <p className="text-[20px]">
                  {totalStock}
                </p>
                <CardDescription className="-mx-2">
                  {Object.keys(item)[0].replace(/([A-Z])/g, " $1").trim()}
                </CardDescription>
              </div>
            </div>
          </Card>
        ))}
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
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                Excel
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <img
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                Excel
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <img
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                Excel
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* PRODUCT TABLE */}
      <ProductTable products={products} />

    </div>
  );
};

export default Product;

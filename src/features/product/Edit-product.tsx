// src/pages/AddProduct.tsx

import { useState, useEffect } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";
import { PlusCircle, UploadCloud } from "lucide-react";
import { OrderItemIn, ProductIn } from "@/interfaces/productInter";
import { ProductData } from "@/data/product.data";
import { getProducts } from './services/getProducts';



export default function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [orderItems, setOrderItems] = useState<OrderItemIn[]>([
    { size: "", quantity: 0, sku: "" },
  ]);

  const [images, setImages] = useState<File[]>([]);

  // const product = useMemo(() => ProductData.find(p => p.id === id), [id]);

  useEffect(() => {
    async function fetchData() {
      const products = await getProducts();
      const found = products.find((p) => p._id === id);
      setProduct(found)
    }
    fetchData();
  }, [id]);






  // const handleOrderItemChange = (
  //   index: number,
  //   field: keyof OrderItemIn,
  //   value: string | number
  // ) => {
  //   const updated = [...orderItems];
  //   updated[index][field] = value as never;
  //   setOrderItems(updated);
  // };

  // const handleAddOrderItem = () => {
  //   setOrderItems([...orderItems, { size: "", quantity: 0, sku: "" }]);
  // };

  // const handleImageUpload = (files: FileList | null) => {
  //   if (files) {
  //     setImages([...images, ...Array.from(files)]);
  //   }
  // };

if (!product) {
  return <div>Loading...</div>;
}
console.log(product)

  return (
    <div className="max-w-4xl mx-auto md:mt-2 mt-3 mb-6">
      <div className="px-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/product" className="text-xs">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">Add Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Card className="md:mt-4 mt-10 w-full p-6">
        <CardHeader>
          <CardTitle>Edit Product {product.name}</CardTitle>
          <CardDescription className="text-gray-500">Fill in product information below.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-9 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2.5">
              <Label>Name</Label>
              <Input placeholder="Product name" />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label>Category</Label>
              <Input placeholder="Category" />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label>Price</Label>
              <Input type="number" placeholder="Price" />
            </div>
            <div className="flex flex-col gap-2.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea placeholder="Product description..." />
            </div>
          </div>

          {/* Order Items */}
          <div className="flex flex-col gap-2.5">
            <Label>Order Items</Label>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 border p-3 rounded-md"
                >
                  <Input
                    placeholder="Size"
                    value={item.size}
                    // onChange={(e) =>
                    //   handleOrderItemChange(index, "size", e.target.value)
                    // }
                  
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    // onChange={(e) =>
                    //   handleOrderItemChange(index, "quantity", Number(e.target.value))
                    // }
                  
                  />
                  <Input
                    placeholder="SKU"
                    value={item.sku}
                    // onChange={(e) =>
                    //   handleOrderItemChange(index, "sku", e.target.value)
                    // }
                  
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                // onClick={handleAddOrderItem}
                className="text-green-500"
              >
                <PlusCircle className="h-3 w-3" />
                More Item
              </Button>
            </div>
          </div>

          {/* Upload Images */}
          <div className="flex flex-col gap-2">
            <Label>Upload Images</Label>

            <Input
              type="file"
              multiple
              // onChange={(e) => handleImageUpload(e.target.files)}
              className="w-28 cursor-pointer"
            />


            {images.length > 0 && (
              <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground">
                {images.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button variant="save">
              <UploadCloud className="h-4 w-4 mr-2" />
              Save Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

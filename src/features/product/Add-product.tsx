// src/pages/AddProduct.tsx

import { useState } from "react";
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
import { OrderItemIn } from "@/interfaces/productInter";
import { useTranslation } from "react-i18next";

export default function AddProductPage() {
  const { t } = useTranslation("product");
  const [orderItems, setOrderItems] = useState<OrderItemIn[]>([
    { size: "", quantity: 0, sku: "" },
  ]);
  const [images, setImages] = useState<File[]>([]);

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItemIn,
    value: string | number
  ) => {
    const updated = [...orderItems];
    updated[index][field] = value as never;
    setOrderItems(updated);
  };

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { size: "", quantity: 0, sku: "" }]);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      setImages([...images, ...Array.from(files)]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto md:mt-2 mt-3 mb-6">
      <div className="px-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/product" className="text-xs">{t("breadcrumb.products")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">{t("breadcrumb.add")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Card className="md:mt-4 mt-10 w-full p-6">
        <CardHeader>
          <CardTitle>{t("form.addTitle")}</CardTitle>
          <CardDescription className="text-gray-500">{t("form.description")}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-9 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2.5">
              <Label>{t("form.name")}</Label>
              <Input placeholder={t("form.namePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label>{t("form.category")}</Label>
              <Input placeholder={t("form.categoryPlaceholder")} />
            </div>
            <div className="flex flex-col gap-2.5">
              <Label>{t("form.price")}</Label>
              <Input type="number" placeholder={t("form.pricePlaceholder")} />
            </div>
            <div className="flex flex-col gap-2.5 md:col-span-2">
              <Label>{t("form.descriptionLabel")}</Label>
              <Textarea placeholder={t("form.descriptionPlaceholder")} />
            </div>
          </div>

          {/* Order Items */}
          <div className="flex flex-col gap-2.5">
            <Label>{t("form.orderItems")}</Label>
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 border p-3 rounded-md"
                >
                  <Input
                    placeholder={t("form.size")}
                    value={item.size}
                    onChange={(e) =>
                      handleOrderItemChange(index, "size", e.target.value)
                    }
                  
                  />
                  <Input
                    type="number"
                    placeholder={t("form.quantity")}
                    value={item.quantity}
                    onChange={(e) =>
                      handleOrderItemChange(index, "quantity", Number(e.target.value))
                    }
                  
                  />
                  <Input
                    placeholder={t("form.sku")}
                    value={item.sku}
                    onChange={(e) =>
                      handleOrderItemChange(index, "sku", e.target.value)
                    }
                  
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={handleAddOrderItem}
                className="text-green-500"
              >
                <PlusCircle className="h-3 w-3" />
                {t("form.moreItem")}
              </Button>
            </div>
          </div>

          {/* Upload Images */}
          <div className="flex flex-col gap-2">
            <Label>{t("form.uploadImages")}</Label>

            <Input
              type="file"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
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
              {t("form.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Building2, Briefcase, ImagePlus } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { OwnerRegisterForm } from "../type";

const companyTypes = [
  "ร้านอาหาร",
  "ร้านค้า / อีคอมเมิร์ซ",
  "ธุรกิจบริการ",
  "สุขภาพ",
  "การศึกษา",
  "อื่นๆ",
];

type Props = {
  form: UseFormReturn<OwnerRegisterForm>;
};

export const StepCompany = ({ form }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyImage = form.watch("companyImage");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!companyImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(companyImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [companyImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    form.setValue("companyImage", compressed, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="companyImage"
        render={({ fieldState }) => (
          <FormItem>
            <div className="flex flex-col items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative size-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 hover:border-primary transition-colors cursor-pointer",
                  fieldState.error ? "border-destructive" : "border-gray-300"
                )}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Company logo" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="text-gray-400 size-6" />
                )}
              </button>
              <FormControl>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </FormControl>
              <FormLabel
                className={cn(
                  "text-xs font-normal",
                  fieldState.error ? "text-destructive" : "text-gray-500"
                )}
              >
                {previewUrl ? "เปลี่ยนโลโก้บริษัท" : "อัปโหลดโลโก้บริษัท (จำเป็น)"}
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                <Building2 className="text-gray-400 w-5" />
              </div>
              <FormControl>
                <Input
                  placeholder="กรุณากรอก ชื่อ บริษํท"
                  {...field}
                  className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 pl-11 placeholder:text-[14px] text-[14px] text-gray-800"
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Type</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full !h-[45px] bg-gray-50 mb-41">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-5" />
                    <SelectValue placeholder="กรุณาเลือกประเภทของธุรกิจ" />
                  </div>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {companyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </div>
  );
};

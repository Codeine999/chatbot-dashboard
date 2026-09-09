import { useRef } from "react";
import { ImagePlus, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image";
import type { OwnerRegisterForm } from "../type";
import { useTranslation } from "react-i18next";

type Props = {
  form: UseFormReturn<OwnerRegisterForm>;
};

export const StepProfile = ({ form }: Props) => {
  const { t } = useTranslation("auth");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatar = form.watch("avatar");
  const username = form.watch("username");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("avatar", reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(compressed);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col items-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative size-20 rounded-full border-2 border-dashed border-gray-300 
          flex items-center justify-center overflow-hidden bg-gray-50 hover:border-primary transition-colors cursor-pointer"
        >
          {avatar ? (
            <img src={avatar} alt={t("register.photo.alt")} className="size-full object-cover" />
          ) : (
            <ImagePlus className="text-gray-400 size-6" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <span className="text-xs text-gray-500">
          {avatar ? t("register.photo.change") : t("register.photo.upload")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.field.firstName")}</FormLabel>
              <div className="relative">
                <div className="absolute px-3 py-2.5 pointer-events-none">
                  <User className="text-gray-400 w-5" />
                </div>
                <FormControl>
                  <Input
                    placeholder={t("register.placeholder.firstName")}
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.field.lastName")}</FormLabel>
              <div className="relative">
                <div className="absolute px-3 py-2.5 pointer-events-none">
                  <User className="text-gray-400 w-5" />
                </div>
                <FormControl>
                  <Input
                    placeholder={t("register.placeholder.lastName")}
                    {...field}
                    className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 pl-11 placeholder:text-[14px] text-[14px] text-gray-800"
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-40">
        <FormItem>
          <FormLabel>{t("register.field.username")}</FormLabel>
          <FormControl>
            <Input
              value={username}
              disabled
              className="bg-gray-50 h-[45px] placeholder:text-[14px] text-[14px] text-gray-500"
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>{t("register.field.role")}</FormLabel>
          <FormControl>
            <Input
              value="Owner"
              disabled
              className="bg-gray-50 h-[45px] placeholder:text-[14px] text-[14px] text-gray-500"
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
};

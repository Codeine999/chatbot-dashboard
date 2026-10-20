import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionCard } from "@/components/common/SectionCard";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BARCODE_MAX, DESCRIPTION_MAX, NAME_MAX, SKU_MAX } from "../../constants";
import { labelClassName } from "./styles";
import type { ProductFormValues } from "../../schema/productForm.schema";

export const BasicInfoSection = () => {
  const { t } = useTranslation("product");
  const { control } = useFormContext<ProductFormValues>();
  const description = useWatch({ control, name: "description" });

  return (
    <SectionCard title={t("form.basic.title")}>
      <div className="flex flex-col gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required className={labelClassName}>
                {t("form.basic.name")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={NAME_MAX}
                  placeholder={t("form.basic.namePlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid items-start gap-x-3 gap-y-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>{t("form.basic.sku")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={SKU_MAX}
                    autoComplete="off"
                    placeholder={t("form.basic.skuPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>{t("form.basic.barcode")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={BARCODE_MAX}
                    autoComplete="off"
                    placeholder={t("form.basic.barcodePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>{t("form.basic.description")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  maxLength={DESCRIPTION_MAX}
                  placeholder={t("form.basic.descriptionPlaceholder")}
                  className="min-h-24 resize-none"
                />
              </FormControl>
              <div className="flex items-start justify-between gap-3">
                <FormMessage />
                <span className="ml-auto shrink-0 text-[11px] text-mini tabular-nums">
                  {description.length} / {DESCRIPTION_MAX}
                </span>
              </div>
            </FormItem>
          )}
        />
      </div>
    </SectionCard>
  );
};

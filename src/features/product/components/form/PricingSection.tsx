import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AddonInput } from "@/components/common/AddonInput";
import { SectionCard } from "@/components/common/SectionCard";
import { SwitchField } from "@/components/common/SwitchField";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { labelClassName } from "./styles";
import type { ProductFormValues } from "../../schema/productForm.schema";

type PriceFieldName = "price" | "compareAtPrice" | "costPrice";

const PRICE_FIELDS: { name: PriceFieldName; required?: boolean; hasHint?: boolean }[] = [
  { name: "price", required: true },
  { name: "compareAtPrice", hasHint: true },
  { name: "costPrice", hasHint: true },
];

export const PricingSection = () => {
  const { t } = useTranslation("product");
  const { control } = useFormContext<ProductFormValues>();
  const trackStock = useWatch({ control, name: "trackStock" });

  return (
    <SectionCard title={t("form.pricing.title")}>
      {/* items-start: ช่องที่มีคำอธิบายใต้ input สูงกว่า ถ้าปล่อย stretch ช่องข้าง ๆ จะถูกยืดจน label เลื่อนลง */}
      <div className="grid items-start gap-x-3 gap-y-4 sm:grid-cols-2">
        {PRICE_FIELDS.map(({ name, required, hasHint }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel required={required} className={labelClassName}>
                  {t(`form.pricing.${name}`)}
                </FormLabel>
                <FormControl>
                  <AddonInput
                    {...field}
                    addon="฿"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                  />
                </FormControl>
                {hasHint && (
                  <FormDescription className="text-xs text-mini">
                    {t(`form.pricing.${name}Hint`)}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel required className={labelClassName}>
                {t("form.pricing.stock")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-xl bg-hover/60 p-4">
        <FormField
          control={control}
          name="trackStock"
          render={({ field }) => (
            <SwitchField
              label={t("form.pricing.trackStock")}
              description={t("form.pricing.trackStockHint")}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <FormField
          control={control}
          name="lowStockThreshold"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <div className="flex items-center justify-between gap-4">
                {/* ขนาดเดียวกับ label ของสวิตช์ด้านบน เพราะอยู่ในกล่องเดียวกัน */}
                <FormLabel className="text-sm font-medium text-normal">
                  {t("form.pricing.lowStockThreshold")}
                </FormLabel>
                <div className="flex items-center gap-2.5">
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!trackStock}
                      inputMode="numeric"
                      autoComplete="off"
                      className="w-20 bg-card"
                    />
                  </FormControl>
                  <span className="text-xs text-mini">{t("form.pricing.unit")}</span>
                </div>
              </div>
              <FormMessage className="text-right" />
            </FormItem>
          )}
        />
      </div>
    </SectionCard>
  );
};

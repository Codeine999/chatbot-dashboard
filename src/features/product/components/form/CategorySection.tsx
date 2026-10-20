import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CreatableCombobox } from "@/components/common/CreatableCombobox";
import { SectionCard } from "@/components/common/SectionCard";
import { TagInput } from "@/components/common/TagInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BRAND_MAX, CATEGORY_MAX, TAG_MAX_COUNT } from "../../constants";
import { labelClassName } from "./styles";
import type { ProductFormValues } from "../../schema/productForm.schema";

type Props = {
  categories: string[];
  brands: string[];
};

export const CategorySection = ({ categories, brands }: Props) => {
  const { t } = useTranslation("product");
  const { control } = useFormContext<ProductFormValues>();

  return (
    <SectionCard title={t("form.category.title")}>
      <div className="flex flex-col gap-4">
        {/* ไม่ผูก onBlur เพราะ focus ย้ายเข้า popover ตอนเปิด จะขึ้น error ทั้งที่ยังเลือกอยู่ */}
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel required className={labelClassName}>
                {t("form.category.category")}
              </FormLabel>
              <FormControl>
                <CreatableCombobox
                  value={field.value}
                  onChange={field.onChange}
                  options={categories}
                  maxLength={CATEGORY_MAX}
                  placeholder={t("form.category.categoryPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>{t("form.category.brand")}</FormLabel>
              <FormControl>
                <CreatableCombobox
                  value={field.value}
                  onChange={field.onChange}
                  options={brands}
                  maxLength={BRAND_MAX}
                  clearable
                  placeholder={t("form.category.brandPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>{t("form.category.tags")}</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  maxTags={TAG_MAX_COUNT}
                  placeholder={t("form.category.tagsPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </SectionCard>
  );
};

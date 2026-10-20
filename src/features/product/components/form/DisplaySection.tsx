import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionCard } from "@/components/common/SectionCard";
import { SwitchField } from "@/components/common/SwitchField";
import { FormField } from "@/components/ui/form";
import type { ProductFormValues } from "../../schema/productForm.schema";

const DISPLAY_FIELDS = ["showOnStorefront", "featured"] as const;

export const DisplaySection = () => {
  const { t } = useTranslation("product");
  const { control } = useFormContext<ProductFormValues>();

  return (
    <SectionCard title={t("form.display.title")}>
      <div className="flex flex-col gap-4">
        {DISPLAY_FIELDS.map((name) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <SwitchField
                label={t(`form.display.${name}`)}
                description={t(`form.display.${name}Hint`)}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        ))}
      </div>
    </SectionCard>
  );
};

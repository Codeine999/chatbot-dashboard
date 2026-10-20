import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { RadioCardGroup } from "@/components/common/RadioCardGroup";
import { SectionCard } from "@/components/common/SectionCard";
import { FormField } from "@/components/ui/form";
import { FORM_STATUSES } from "../../constants";
import type { ProductFormValues } from "../../schema/productForm.schema";

export const StatusSection = () => {
  const { t } = useTranslation("product");
  const { control } = useFormContext<ProductFormValues>();

  const options = FORM_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
    description: t(`form.statusHint.${status}`),
  }));

  return (
    <SectionCard title={t("form.status.title")}>
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            options={options}
          />
        )}
      />
    </SectionCard>
  );
};

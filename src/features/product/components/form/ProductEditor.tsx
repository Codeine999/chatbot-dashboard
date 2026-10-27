import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useProductForm } from "../../hooks/useProductForm";
import { useProductOptions } from "../../hooks/useProducts";
import { BasicInfoSection } from "./BasicInfoSection";
import { CategorySection } from "./CategorySection";
import { DisplaySection } from "./DisplaySection";
import { ImagesSection } from "./ImagesSection";
import { PricingSection } from "./PricingSection";
import { StatusSection } from "./StatusSection";
import type { ProductItem } from "../../type/product.type";

type Props = {
  /** ไม่ส่ง = สร้างสินค้าใหม่ */
  product?: ProductItem;
};

const EMPTY_OPTIONS: string[] = [];

export const ProductEditor = ({ product }: Props) => {
  const { t } = useTranslation("product");
  const editor = useProductForm(product);
  const { data: options } = useProductOptions();
  const mode = editor.isEdit ? "edit" : "add";

  return (
    <Form {...editor.form}>
      {/* ไม่ให้ Enter ในช่องกรอกส่งฟอร์มเอง เพราะปุ่มหลักคือการวางขายทันที */}
      <form noValidate onSubmit={(event) => event.preventDefault()} className="pt-4 pb-12">
        <PageHeader
          title={t(`form.${mode}Title`)}
          subtitle={t(`form.${mode}Subtitle`)}
          leading={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 rounded-xl border"
              onClick={editor.cancel}
              aria-label={t("form.back")}
            >
              <ArrowLeft className="size-5 text-mini" />
            </Button>
          }
          actions={
            <>
              <Button
                type="button"
                variant="ghost"
                className="border"
                disabled={editor.isSaving}
                onClick={editor.cancel}
              >
                {t("form.cancel")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="border"
                disabled={editor.isSaving}
                onClick={editor.saveDraft}
              >
                {editor.savingStatus === "DRAFT" ? t("form.saving") : t("form.saveDraft")}
              </Button>
              <Button type="button" disabled={editor.isSaving} onClick={editor.publish}>
                {editor.savingStatus === "ACTIVE" ? t("form.saving") : t("form.savePublish")}
              </Button>
            </>
          }
        />

        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-4">
            <BasicInfoSection />
            <ImagesSection images={editor.images} />
            <PricingSection />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <StatusSection />
            <CategorySection
              categories={options?.categories ?? EMPTY_OPTIONS}
              brands={options?.brands ?? EMPTY_OPTIONS}
            />
            <DisplaySection />
          </div>
        </div>
      </form>
    </Form>
  );
};

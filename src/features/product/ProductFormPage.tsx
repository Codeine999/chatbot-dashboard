import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductEditor } from "./components/form/ProductEditor";
import { ProductEditorSkeleton } from "./components/form/ProductEditorSkeleton";
import { useProduct } from "./hooks/useProducts";

/** /product/add และ /product/:id/edit ใช้ฟอร์มเดียวกัน */
export default function ProductFormPage() {
  const { t } = useTranslation("product");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productQuery = useProduct(id);

  if (!id) return <ProductEditor />;

  if (productQuery.isLoading) return <ProductEditorSkeleton />;

  if (productQuery.isError || !productQuery.data) {
    return (
      <Card className="mt-6 flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-sm text-destructive">{t("form.loadFailed")}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/product")}>
            {t("form.back")}
          </Button>
          <Button onClick={() => productQuery.refetch()}>{t("common:actions.retry")}</Button>
        </div>
      </Card>
    );
  }

  // ฟอร์มอ่านค่าเริ่มต้นครั้งเดียวตอน mount จึง render หลังโหลดเสร็จ และใส่ key กันค้างค่าของสินค้าก่อนหน้า
  return <ProductEditor key={productQuery.data.id} product={productQuery.data} />;
}

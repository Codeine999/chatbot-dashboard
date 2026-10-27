import { useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { TablePagination } from "@/components/common/TablePagination";
import { UnderlineTabs } from "@/components/common/UnderlineTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRowSelection } from "@/hooks/useRowSelection";
import { cn } from "@/lib/utils";
import { ProductDetailEmpty } from "./components/detail/ProductDetailEmpty";
import { ProductDetailPanel } from "./components/detail/ProductDetailPanel";
import { ProductEmptyState } from "./components/list/ProductEmptyState";
import { ProductFilterBar } from "./components/list/ProductFilterBar";
import { ProductStats } from "./components/list/ProductStats";
import { ProductTable } from "./components/list/ProductTable";
import { PRODUCT_TABS, type ProductTab } from "./constants";
import { useProductFilters } from "./hooks/useProductFilters";
import {
  useDeleteProduct,
  useDuplicateProduct,
  useProductList,
  useProductStats,
} from "./hooks/useProducts";
import type { ProductItem } from "./type/product.type";

const EMPTY_PRODUCTS: ProductItem[] = [];

/** ตรงกับ breakpoint xl — กว้างพอวางแผงรายละเอียดข้างตาราง ถ้าแคบกว่านี้ใช้ drawer แทน */
const SIDE_PANEL_QUERY = "(min-width: 80rem)";

export default function ProductList() {
  const { t } = useTranslation("product");
  const navigate = useNavigate();
  const hasSidePanel = useMediaQuery(SIDE_PANEL_QUERY);

  const [tab, setTab] = useState<ProductTab>("products");
  const [selectedId, setSelectedId] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<ProductItem>();

  const productList = useProductList();
  const products = productList.data ?? EMPTY_PRODUCTS;
  const stats = useProductStats();
  const list = useProductFilters(products);
  const selection = useRowSelection();
  const duplicateProduct = useDuplicateProduct();
  const deleteProduct = useDeleteProduct();

  // ตัวกรองแสดงเฉพาะหมวดที่มีสินค้าอยู่จริง เลือกแล้วจะได้ไม่เจอตารางว่าง
  const categories = useMemo(
    () =>
      [...new Set(products.map((item) => item.category).filter(Boolean))].sort((left, right) =>
        left.localeCompare(right, "th")
      ),
    [products]
  );

  const selected = products.find((item) => item.id === selectedId);
  const pageIds = list.pageItems.map((item) => item.id);
  const isEmpty = productList.isSuccess && products.length === 0;
  const tabs = PRODUCT_TABS.map((value) => ({ value, label: t(`tab.${value}`) }));

  const goToAdd = () => navigate("/product/add");
  const goToImport = () => setTab("import");
  const closeDetail = () => setSelectedId(undefined);

  const viewLowStock = () => {
    setTab("products");
    list.setFilter("stock", "low");
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    deleteProduct.mutate(pendingDelete.id, {
      onSuccess: () => {
        if (pendingDelete.id === selectedId) closeDetail();
        if (selection.isSelected(pendingDelete.id)) selection.toggle(pendingDelete.id);
        setPendingDelete(undefined);
      },
    });
  };

  const renderDetailPanel = (className: string) =>
    selected && (
      <ProductDetailPanel
        key={selected.id}
        product={selected}
        isDuplicating={duplicateProduct.isPending}
        onClose={closeDetail}
        onEdit={() => navigate(`/product/${selected.id}/edit`)}
        onDuplicate={() =>
          duplicateProduct.mutate(selected.id, { onSuccess: (copy) => setSelectedId(copy.id) })
        }
        onDelete={() => setPendingDelete(selected)}
        className={className}
      />
    );

  const tabsBar = <UnderlineTabs tabs={tabs} value={tab} onChange={setTab} />;

  const renderBody = () => {
    if (isEmpty) {
      return (
        <div className="mt-5 flex flex-col gap-4">
          {tabsBar}
          {tab === "products" ? (
            <ProductEmptyState
              onAddManually={goToAdd}
              onImportFile={goToImport}
              onSyncStore={goToImport}
            />
          ) : (
            <TabTodo label={t(`tab.${tab}`)} hint={t("tabTodo")} />
          )}
        </div>
      );
    }

    if (tab !== "products") {
      return (
        <>
          <div className="mt-5">
            <ProductStats stats={stats.data} isLoading={stats.isLoading} onViewLowStock={viewLowStock} />
          </div>
          <div className="mt-8">{tabsBar}</div>
          <TabTodo label={t(`tab.${tab}`)} hint={t("tabTodo")} className="mt-4" />
        </>
      );
    }

    return (
      <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ProductStats stats={stats.data} isLoading={stats.isLoading} onViewLowStock={viewLowStock} />

          <div className="mt-4">{tabsBar}</div>

          <Card className="flex min-w-0 flex-col p-4">
            <ProductFilterBar
              filters={list.filters}
              categories={categories}
              onChange={list.setFilter}
            />

            <div className="mt-3">
              <ProductTable
                items={list.pageItems}
                activeId={selectedId}
                isLoading={productList.isLoading}
                isError={productList.isError}
                onRetry={() => productList.refetch()}
                isSelected={selection.isSelected}
                isAllSelected={selection.isAllSelected(pageIds)}
                onToggleSelect={selection.toggle}
                onToggleSelectAll={() => selection.toggleAll(pageIds)}
                onOpen={(item) => setSelectedId(item.id)}
              />
            </div>

            <TablePagination
              page={list.page}
              pageSize={list.pageSize}
              total={list.total}
              onPageChange={list.setPage}
              onPageSizeChange={list.setPageSize}
              className="mt-3 border-t pt-3"
            />
          </Card>
        </div>

        {hasSidePanel ? (
          // แผงสูงเท่าคอลัมน์ซ้ายแล้วเลื่อนภายในเอง เหมือนแผงในหน้าคลังความรู้ AI
          <div className="relative min-h-0 self-stretch">
            {renderDetailPanel("absolute inset-0") || (
              <ProductDetailEmpty className="absolute inset-0" />
            )}
          </div>
        ) : (
          <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && closeDetail()}>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-full gap-0 border-0 p-0 sm:max-w-md"
            >
              <SheetTitle className="sr-only">{t("detail.title")}</SheetTitle>
              {renderDetailPanel("h-full rounded-none border-0")}
            </SheetContent>
          </Sheet>
        )}
      </div>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Button variant="ghost" className="gap-1.5 border" onClick={goToImport}>
              <Upload className="size-4 text-icons" />
              {t("actions.bulkImport")}
            </Button>
            <Button className="gap-1.5" onClick={goToAdd}>
              <Plus className="size-4" />
              {t("actions.add")}
            </Button>
          </>
        }
      />

      {renderBody()}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={t("confirmDelete.title")}
        description={t("confirmDelete.description", { name: pendingDelete?.name })}
        confirmLabel={t("confirmDelete.confirm")}
        destructive
        isPending={deleteProduct.isPending}
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}

const TabTodo = ({ label, hint, className }: { label: string; hint: string; className?: string }) => (
  <Card className={cn("p-10 text-center", className)}>
    <p className="text-sm text-normal">{label}</p>
    <p className="mt-1 text-xs text-mini">{hint}</p>
  </Card>
);

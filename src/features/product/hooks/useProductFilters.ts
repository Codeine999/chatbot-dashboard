import { useCallback, useMemo, useState } from "react";
import { PRODUCT_PAGE_SIZE } from "../constants";
import { filterProducts } from "../utils/product";
import type { ProductFilters, ProductItem } from "../type/product.type";

const INITIAL_FILTERS: ProductFilters = {
  search: "",
  category: "all",
  status: "all",
  stock: "all",
};

/** ตัวกรอง + แบ่งหน้าของตารางสินค้า (กรองฝั่ง client) */
export function useProductFilters(items: ProductItem[]) {
  const [filters, setFilters] = useState<ProductFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(PRODUCT_PAGE_SIZE);

  const setFilter = useCallback(
    <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
      // เปลี่ยนตัวกรองแล้วกลับหน้าแรก ไม่งั้นอาจค้างอยู่หน้าที่ไม่มีข้อมูลแล้ว
      setPage(1);
    },
    []
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const filtered = useMemo(() => filterProducts(items, filters), [items, filters]);

  // ลบสินค้าตัวสุดท้ายของหน้าสุดท้ายแล้ว page จะเกินจำนวนหน้า จึงบีบไว้ตรงนี้
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  return {
    filters,
    setFilter,
    pageItems,
    total: filtered.length,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
  };
}

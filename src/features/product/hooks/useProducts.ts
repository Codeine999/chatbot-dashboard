import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import { ProductServiceError, productApi } from "../services/product.service";
import { toProductItem } from "../utils/mapper";
import type { Product, ProductErrorCode } from "../type/product.type";

export const productKeys = {
  all: ["products"] as const,
  list: () => [...productKeys.all, "list"] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
  options: () => [...productKeys.all, "options"] as const,
};

export const getProductErrorCode = (error: unknown): ProductErrorCode | undefined =>
  error instanceof ProductServiceError ? error.code : undefined;

const toastError = (error: unknown, fallbackKey: string) => {
  const code = getProductErrorCode(error);
  toast.error(
    code ? i18n.t(`product:error.${code}`) : getApiErrorMessage(error, i18n.t(fallbackKey))
  );
};

// ประกาศไว้นอก hook เพื่อให้ reference คงที่ react-query จะได้ไม่ map ใหม่ทุก render
const selectItems = (products: Product[]) => products.map(toProductItem);

export function useProductList() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: productApi.getAll,
    select: selectItems,
    staleTime: 30 * 1000,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => productApi.getById(id as string),
    select: toProductItem,
    enabled: Boolean(id),
    // หน้าแก้ไขต้องได้ revision ล่าสุดเสมอ ไม่งั้นบันทึกแล้วจะชนกับ VERSION_CONFLICT
    staleTime: 0,
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: productApi.getStats,
    staleTime: 30 * 1000,
  });
}

export function useProductOptions() {
  return useQuery({
    queryKey: productKeys.options(),
    queryFn: productApi.getOptions,
    staleTime: 5 * 60 * 1000,
  });
}

/** การแก้สินค้าตัวเดียวกระทบทั้งลิสต์ สถิติ และตัวเลือกหมวด/แบรนด์ จึงล้างทั้งหมด */
const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
};

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: (product) => {
      invalidate();
      toast.success(
        i18n.t(product.status === "ACTIVE" ? "product:toast.published" : "product:toast.draftSaved")
      );
    },
    onError: (error) => toastError(error, "product:toast.saveFailed"),
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("product:toast.updated"));
    },
    onError: (error) => toastError(error, "product:toast.saveFailed"),
  });
}

export function useAdjustStock() {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: productApi.adjustStock,
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("product:toast.stockUpdated"));
    },
    onError: (error) => {
      // มีคนปรับสต็อกตัวนี้ไปก่อน ดึงค่าล่าสุดมาให้ผู้ใช้ตัดสินใจใหม่
      if (getProductErrorCode(error) === "VERSION_CONFLICT") invalidate();
      toastError(error, "product:toast.stockFailed");
    },
  });
}

export function useDuplicateProduct() {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: productApi.duplicate,
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("product:toast.duplicated"));
    },
    onError: (error) => toastError(error, "product:toast.duplicateFailed"),
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("product:toast.deleted"));
    },
    onError: (error) => toastError(error, "product:toast.deleteFailed"),
  });
}

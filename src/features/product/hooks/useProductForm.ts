import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useImageUpload, type RejectedImage, type UploadImage } from "@/hooks/useImageUpload";
import { IMAGE_ACCEPT, IMAGE_MAX_COUNT, IMAGE_MAX_SIZE_MB } from "../constants";
import {
  productFormDefaults,
  productFormSchema,
  type ProductFormValues,
} from "../schema/productForm.schema";
import { toFormValues, toUpsertPayload } from "../utils/mapper";
import { getProductErrorCode, useCreateProduct, useUpdateProduct } from "./useProducts";
import type { ProductImageInput, ProductItem, ProductStatus } from "../type/product.type";

const PRODUCT_LIST_PATH = "/product";

const toImageInputs = (images: UploadImage[]): ProductImageInput[] =>
  images.map((image) =>
    image.file ? { kind: "new", file: image.file } : { kind: "existing", url: image.url }
  );

/**
 * state ทั้งหมดของหน้าเพิ่ม/แก้ไขสินค้า
 * ส่ง product มาเมื่อแก้ไข ค่าเริ่มต้นอ่านครั้งเดียวตอน mount
 * จึงควร render ฟอร์มหลังโหลดสินค้าเสร็จแล้วเท่านั้น
 */
export function useProductForm(product?: ProductItem) {
  const { t } = useTranslation("product");
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const mutation = product ? updateProduct : createProduct;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? toFormValues(product) : productFormDefaults,
    mode: "onTouched",
  });

  const images = useImageUpload({
    initialUrls: product?.images,
    maxCount: IMAGE_MAX_COUNT,
    maxSizeMB: IMAGE_MAX_SIZE_MB,
    accept: IMAGE_ACCEPT,
    onReject: (rejected: RejectedImage[]) => {
      // รวมเป็นข้อความเดียวต่อเหตุผล ไม่ให้ toast เด้งทีละไฟล์
      new Set(rejected.map((item) => item.reason)).forEach((reason) =>
        toast.error(
          t(`validation.image.${reason}`, { size: IMAGE_MAX_SIZE_MB, max: IMAGE_MAX_COUNT })
        )
      );
    },
  });

  const backToList = () => navigate(PRODUCT_LIST_PATH);

  /**
   * ปุ่มบนหัวหน้ากำหนดสถานะที่จะบันทึกเอง
   * ใส่ลง payload ตรง ๆ ไม่ setValue ในฟอร์ม เพื่อให้กดแล้ว validate ไม่ผ่านจะไม่เปลี่ยน radio สถานะ
   */
  const submit = (status: ProductStatus) => {
    void form.handleSubmit((values) => {
      const payload = toUpsertPayload({ ...values, status }, toImageInputs(images.images));
      const callbacks = {
        onSuccess: backToList,
        onError: (error: unknown) => {
          if (getProductErrorCode(error) === "SKU_TAKEN") {
            form.setError("sku", { message: "product:validation.skuTaken" }, { shouldFocus: true });
          }
        },
      };

      if (product) {
        updateProduct.mutate({ ...payload, id: product.id, revision: product.revision }, callbacks);
      } else {
        createProduct.mutate(payload, callbacks);
      }
    })();
  };

  return {
    form,
    images,
    isEdit: Boolean(product),
    isSaving: mutation.isPending,
    /** สถานะของปุ่มที่กำลังบันทึก ใช้แสดง loading ให้ถูกปุ่ม */
    savingStatus: mutation.isPending ? mutation.variables?.status : undefined,
    saveDraft: () => submit("DRAFT"),
    publish: () => submit("ACTIVE"),
    cancel: backToList,
  };
}

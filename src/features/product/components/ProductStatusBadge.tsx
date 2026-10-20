import { useTranslation } from "react-i18next";
import { DotBadge } from "@/components/common/DotBadge";
import { STATUS_TONE } from "../utils/product";
import type { ProductStatus } from "../type/product.type";

export const ProductStatusBadge = ({ status }: { status: ProductStatus }) => {
  const { t } = useTranslation("product");

  return <DotBadge tone={STATUS_TONE[status]}>{t(`status.${status}`)}</DotBadge>;
};

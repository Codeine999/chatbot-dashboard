import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageThumb } from "@/components/common/ImageThumb";
import { cn } from "@/lib/utils";
import { DETAIL_VISIBLE_THUMBS } from "../../constants";

type Props = {
  images: string[];
  name: string;
};

/** รูปใหญ่ + แถบรูปย่อ รูปเกินจำนวนที่แสดงได้รวมเป็นปุ่ม +N กดแล้วกางออกทั้งหมด */
export const ProductGallery = ({ images, name }: Props) => {
  const { t } = useTranslation("product");
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const collapsed = !expanded && images.length > DETAIL_VISIBLE_THUMBS;
  // ช่องสุดท้ายถูกใช้เป็นปุ่ม +N จึงแสดงรูปน้อยลงหนึ่งช่อง
  const visibleImages = collapsed ? images.slice(0, DETAIL_VISIBLE_THUMBS - 1) : images;
  const hiddenCount = images.length - visibleImages.length;

  return (
    <div>
      <ImageThumb
        src={images[activeIndex]}
        alt={name}
        className="aspect-16/10 w-full rounded-xl"
        iconClassName="size-8"
      />

      {images.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleImages.map((src, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                // รูปซ้ำ URL กันได้ จึงใช้ลำดับเป็น key (ลิสต์นี้ไม่มีการสลับลำดับ)
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={t("detail.imageN", { index: index + 1 })}
                aria-pressed={isActive}
                className="cursor-pointer rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <ImageThumb
                  src={src}
                  alt=""
                  iconClassName="size-4"
                  className={cn(
                    "size-12 rounded-lg transition-colors",
                    isActive ? "border-2 border-icons" : "hover:border-primary/40"
                  )}
                />
              </button>
            );
          })}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={t("detail.moreImages", { count: hiddenCount })}
              className="flex size-12 cursor-pointer items-center justify-center rounded-lg border bg-hover text-xs font-medium text-mini transition hover:text-normal"
            >
              +{hiddenCount}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilePicker } from "@/components/common/FilePicker";
import { ImageDropzone } from "@/components/common/ImageDropzone";
import { ImageThumb } from "@/components/common/ImageThumb";
import { SectionCard } from "@/components/common/SectionCard";
import type { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";
import { IMAGE_ACCEPT, IMAGE_MAX_COUNT, IMAGE_MAX_SIZE_MB } from "../../constants";

type Props = {
  images: ReturnType<typeof useImageUpload>;
};

const ACCEPT = IMAGE_ACCEPT.join(",");

/** รูปแรกคือรูปหลัก กดรูปอื่นเพื่อย้ายขึ้นมาเป็นรูปหลัก */
export const ImagesSection = ({ images }: Props) => {
  const { t } = useTranslation("product");

  return (
    <SectionCard title={t("form.images.title")}>
      <ImageDropzone
        accept={ACCEPT}
        disabled={!images.canAddMore}
        onFiles={images.addFiles}
        label={t("form.images.drop")}
        browseLabel={t("form.images.browse")}
        hint={t("form.images.hint", { size: IMAGE_MAX_SIZE_MB, max: IMAGE_MAX_COUNT })}
      />

      {images.images.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.images.map((image, index) => {
            const isPrimary = index === 0;

            return (
              <li key={image.id} className="relative">
                <button
                  type="button"
                  disabled={isPrimary}
                  onClick={() => images.makePrimary(image.id)}
                  aria-label={isPrimary ? t("form.images.primary") : t("form.images.setPrimary")}
                  className="block cursor-pointer rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
                >
                  <ImageThumb
                    src={image.url}
                    alt=""
                    className={cn(
                      "size-20 rounded-xl transition-colors",
                      isPrimary ? "border-2 border-icons" : "hover:border-primary/40"
                    )}
                  />
                </button>

                {isPrimary && (
                  <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-icons px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {t("form.images.primary")}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => images.remove(image.id)}
                  aria-label={t("form.images.remove", { index: index + 1 })}
                  className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white text-normal shadow-sm transition hover:text-red-500 dark:bg-card"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}

          {images.canAddMore && (
            <li>
              <FilePicker
                accept={ACCEPT}
                multiple
                onFiles={images.addFiles}
                className="flex size-20 items-center justify-center rounded-xl border border-dashed border-slate-300 text-icons transition hover:border-primary/50 hover:bg-primary/5 dark:border-border"
              >
                <Plus className="size-5" aria-hidden />
                <span className="sr-only">{t("form.images.add")}</span>
              </FilePicker>
            </li>
          )}
        </ul>
      )}
    </SectionCard>
  );
};

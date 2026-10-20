import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
};

/** รูปย่อที่ fallback เป็นไอคอนเมื่อไม่มีรูปหรือโหลดรูปไม่สำเร็จ */
export const ImageThumb = ({ src, alt, className, iconClassName }: Props) => {
  // จำ src ที่โหลดพังไว้แทน boolean เพื่อให้เปลี่ยน src ใหม่แล้วลองโหลดอีกรอบได้เอง
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border bg-hover text-mini",
        className
      )}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src ?? undefined)}
          className="size-full object-cover"
        />
      ) : (
        <ImageIcon className={cn("size-5", iconClassName)} aria-hidden />
      )}
    </div>
  );
};

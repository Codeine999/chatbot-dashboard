import { CANVAS_ASPECT_RATIO, boundsToPercent } from "../layout";
import type { RichMenu } from "../type";
import { cn } from "@/lib/utils";

/** ภาพย่อของเมนู — ใช้ภาพจริงถ้ามี ถ้ายังไม่มีก็วาดเป็นผังช่องแทน */
export const MenuThumbnail = ({
  menu,
  highlightAreaId,
  className,
}: {
  menu: RichMenu;
  highlightAreaId?: string;
  className?: string;
}) => {
  // มีภาพแล้วก็ไม่ต้องวาดผังทับ เหลือไว้แค่กรอบของช่องที่กำลังเลือก
  const areas = menu.image
    ? menu.areas.filter((area) => area.id === highlightAreaId)
    : menu.areas;

  return (
    <div
      className={cn("relative overflow-hidden rounded-md border bg-muted/40", className)}
      style={{ aspectRatio: CANVAS_ASPECT_RATIO }}
    >
      {menu.image ? (
        <img src={menu.image} alt="" className="size-full object-cover" />
      ) : null}

      {areas.map((area) => (
        <span
          key={area.id}
          className={cn("absolute", menu.image ? "p-0" : "p-[4%]")}
          style={boundsToPercent(area.bounds)}
        >
          <span
            className={cn(
              "block size-full rounded-[2px]",
              area.id === highlightAreaId
                ? menu.image
                  ? "bg-primary/25 ring-1 ring-inset ring-primary"
                  : "bg-primary"
                : "bg-foreground/12"
            )}
          />
        </span>
      ))}
    </div>
  );
};

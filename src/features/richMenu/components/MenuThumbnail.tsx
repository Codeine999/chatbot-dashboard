import { CANVAS_ASPECT_RATIO, boundsToPercent, cellBounds } from "../layout";
import type { RichMenu } from "../type";
import { cn } from "@/lib/utils";

/** ภาพย่อของเมนู — ใช้ภาพที่ backend ประกอบไว้ถ้ามี ถ้ายังไม่มีก็วาดเป็นผังช่องแทน */
export const MenuThumbnail = ({
  menu,
  highlightIndex,
  className,
}: {
  menu: RichMenu;
  highlightIndex?: number;
  className?: string;
}) => {
  // มีภาพแล้วก็ไม่ต้องวาดผังทับ เหลือไว้แค่กรอบของช่องที่กำลังเลือก
  const indexes = menu.image
    ? menu.cellList
        .filter((cell) => cell.index === highlightIndex)
        .map((cell) => cell.index)
    : menu.cellList.map((cell) => cell.index);

  return (
    <div
      className={cn("relative overflow-hidden rounded-md border bg-muted/40", className)}
      style={{ aspectRatio: CANVAS_ASPECT_RATIO }}
    >
      {menu.image ? (
        <img src={menu.image} alt="" className="size-full object-cover" />
      ) : null}

      {indexes.map((index) => (
        <span
          key={index}
          className={cn("absolute", menu.image ? "p-0" : "p-[4%]")}
          style={boundsToPercent(cellBounds(index, menu.cells))}
        >
          <span
            className={cn(
              "block size-full rounded-[2px]",
              index === highlightIndex
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

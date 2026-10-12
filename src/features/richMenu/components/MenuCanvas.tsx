import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  BatteryFull,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  ImageUp,
  Link2,
  Loader2,
  Menu,
  Search,
  Send,
  Signal,
  Smile,
  Trash2,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanyBrandInfo } from "@/features/company/hooks/useCompany";
import { resolveImageUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

import {
  CANVAS_ASPECT_RATIO,
  RICH_MENU_IMAGE_TYPES,
  RICH_MENU_LAYOUTS,
  boundsToPercent,
  cellBounds,
  getCellIssueKey,
} from "../layout";
import type { RichMenu, RichMenuCell } from "../type";

export type CanvasCell = RichMenuCell & { missingReply?: boolean };

/** สัญลักษณ์เล็ก ๆ ของผัง วาดด้วย grid แทนไอคอน จะได้ตรงกับจำนวนช่องจริง */
const LayoutGlyph = ({ columns, rows }: { columns: number; rows: number }) => (
  <span
    className="grid h-3 w-[18px] gap-[2px]"
    style={{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    }}
  >
    {Array.from({ length: columns * rows }).map((_, index) => (
      <span key={index} className="rounded-[1px] bg-current" />
    ))}
  </span>
);

const LayoutPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (cells: number) => void;
}) => {
  const { t } = useTranslation("richMenu");

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
      {RICH_MENU_LAYOUTS.map((layout) => (
        <Tooltip key={layout.cells}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onChange(layout.cells)}
              aria-label={t("layout.cells", { count: layout.cells })}
              aria-pressed={layout.cells === value}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors",
                "outline-none focus-visible:ring-[2px] focus-visible:ring-ring/50",
                layout.cells === value
                  ? "bg-background text-primary shadow-sm"
                  : "text-mini hover:text-normal"
              )}
            >
              <LayoutGlyph columns={layout.columns} rows={layout.rows} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {t("layout.cells", { count: layout.cells })}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

/**
 * ช่องหนึ่งช่องบนตัวอย่าง
 *
 * รูปที่เห็นมาจากภาพรวมที่ backend ประกอบแล้ว ช่องนี้จึงวาดแค่กรอบทับ ไม่ได้
 * วางรูปของตัวเองซ้อน — ที่เห็นบนจอจึงเป็นสิ่งเดียวกับที่จะขึ้นไปอยู่บน LINE
 */
const CellTile = ({
  cell,
  cells,
  hasImage,
  isSelected,
  onSelect,
}: {
  cell: CanvasCell;
  cells: number;
  hasImage: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const hasIssue =
    Boolean(getCellIssueKey(cell.button, Boolean(cell.image))) ||
    Boolean(cell.missingReply);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={cell.label}
      aria-pressed={isSelected}
      style={boundsToPercent(cellBounds(cell.index, cells))}
      className={cn(
        "absolute flex cursor-pointer items-center justify-center overflow-hidden p-1 text-center transition-colors outline-none",
        "ring-1 ring-inset ring-black/8 dark:ring-white/10",
        cell.image || hasImage
          ? "hover:bg-primary/15"
          : "bg-background/55 hover:bg-background/80",
        isSelected && "z-10 bg-primary/12 ring-2 ring-primary hover:bg-primary/15"
      )}
    >
      {cell.image ? null : (
        <span className="line-clamp-2 text-[11px] leading-tight font-medium text-normal/75">
          {cell.label}
        </span>
      )}

      {cell.button.kind === "uri" && (
        <Link2 className="absolute left-1 top-1 size-3 text-primary/70" />
      )}

      {hasIssue && (
        <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
      )}

      {isSelected &&
        [
          "left-[3px] top-[3px]",
          "right-[3px] top-[3px]",
          "left-[3px] bottom-[3px]",
          "right-[3px] bottom-[3px]",
        ].map((position) => (
          <span
            key={position}
            className={cn("absolute size-1.5 rounded-[1px] bg-primary", position)}
          />
        ))}
    </button>
  );
};

/** โครงเครื่องแบบ iPhone ที่มี Dynamic Island — ให้เห็นสัดส่วนจริงตอนเมนูไปอยู่ในห้องแชท */
const PhonePreview = ({
  menu,
  cells,
  cellList,
  selectedCell,
  onSelectCell,
}: {
  menu: RichMenu;
  cells: number;
  cellList: CanvasCell[];
  selectedCell: number;
  onSelectCell: (index: number) => void;
}) => {
  const { t } = useTranslation("richMenu");
  const { data: brandInfo } = useCompanyBrandInfo();

  const accountName = brandInfo?.name || t("preview.fallbackName");

  const avatar = brandInfo?.image ? (
    <img
      src={resolveImageUrl(brandInfo.image)}
      alt=""
      className="size-full object-cover"
    />
  ) : (
    <span className="flex size-full items-center justify-center text-[11px] font-semibold text-primary">
      {accountName.slice(0, 1)}
    </span>
  );

  return (
    <div className="flex justify-center rounded-2xl bg-muted/25 px-4 py-8">
      {/* ตัวเครื่องเป็นสีเข้มทั้งสองธีม จะได้อ่านเป็นมือถือ ไม่ใช่การ์ดอีกใบซ้อนกัน */}
      <div className="w-full max-w-[22rem] rounded-[3rem] bg-neutral-800 p-[10px] shadow-[0_24px_60px_rgba(15,17,45,0.22)] dark:bg-neutral-700">
        {/* ล็อกสัดส่วนจอไว้ให้สูงเท่าเครื่องจริง ห้องแชทจะได้ยืดกินที่ที่เหลือ */}
        <div className="relative flex aspect-[9/18] flex-col overflow-hidden rounded-[2.4rem] bg-background">
          <div className="relative flex h-12 shrink-0 items-center justify-between bg-background px-6 pt-1">
            <span className="text-[12px] font-semibold tracking-tight text-normal">
              {t("preview.time")}
            </span>

            {/* Dynamic Island เป็นสีดำเสมอ ไม่ผูกกับธีม เหมือนของจริง */}
            <span className="absolute left-1/2 top-2.5 flex h-[26px] w-[88px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5">
              <span className="size-2 rounded-full bg-neutral-700" />
            </span>

            <span className="flex items-center gap-1 text-normal">
              <Signal className="size-3.5" />
              <Wifi className="size-3.5" />
              <BatteryFull className="size-4" />
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2">
            <ChevronLeft className="size-4 shrink-0 text-mini" />

            <div className="size-7 shrink-0 overflow-hidden rounded-full bg-primary/10">
              {avatar}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-normal">
                {accountName}
              </p>
              <p className="truncate text-[10px] text-mini">{t("preview.subtitle")}</p>
            </div>

            <Search className="size-4 shrink-0 text-mini" />
            <Menu className="size-4 shrink-0 text-mini" />
          </div>

          {/* ข้อความกองอยู่ก้นห้องเหมือนแชทจริง ที่ว่างจึงไปอยู่ด้านบนแทนที่จะแหว่งกลางจอ */}
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 bg-muted/70 px-3 py-3">
            <div className="flex justify-center">
              <span className="rounded-full bg-foreground/8 px-2.5 py-0.5 text-[10px] text-mini">
                {t("preview.today")}
              </span>
            </div>

            {/* ตัวอย่างบทสนทนาจริง: ลูกค้ากดปุ่ม ข้อความบนปุ่มขึ้นในแชท แล้วบอทตอบ */}
            <PreviewConversation cell={cellList[selectedCell]} avatar={avatar} />
          </div>

          <div
            className="relative w-full shrink-0 bg-muted/50"
            style={{ aspectRatio: CANVAS_ASPECT_RATIO }}
          >
            {menu.image && (
              <img
                src={menu.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}

            {cellList.map((cell) => (
              <CellTile
                key={cell.index}
                cell={cell}
                cells={cells}
                hasImage={Boolean(menu.image)}
                isSelected={cell.index === selectedCell}
                onSelect={() => onSelectCell(cell.index)}
              />
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t bg-background px-3 py-2.5">
            <p className="min-w-0 flex-1 truncate text-[11.5px] text-mini">
              {menu.chatBarText || t("preview.inputPlaceholder")}
            </p>
            <Smile className="size-4 shrink-0 text-mini" />
            <Send className="size-4 shrink-0 text-emerald-500" />
          </div>

          {/* แถบ home indicator ปิดท้าย ให้จบเป็นทรงเครื่อง iOS */}
          <div className="flex shrink-0 justify-center bg-background pb-2 pt-1.5">
            <span className="h-[5px] w-[34%] rounded-full bg-foreground/25" />
          </div>
        </div>
      </div>
    </div>
  );
};

/** ให้เห็นว่ากดปุ่มที่เลือกอยู่แล้วบทสนทนาจะออกมาหน้าตาแบบไหน */
const PreviewConversation = ({
  cell,
  avatar,
}: {
  cell?: CanvasCell & { replyText?: string };
  avatar: React.ReactNode;
}) => {
  const { t } = useTranslation("richMenu");

  if (!cell || cell.button.kind !== "reply") {
    return (
      <div className="flex items-start gap-2 pr-8">
        <div className="mt-0.5 size-6 shrink-0 overflow-hidden rounded-full bg-primary/10">
          {avatar}
        </div>
        <p className="w-fit rounded-2xl rounded-tl-md bg-background px-3 py-2 text-[12px] leading-relaxed text-normal shadow-sm">
          {t("preview.greeting")}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ข้อความที่ลูกค้า "พูด" คือ label ของปุ่ม เพราะ LINE echo ลงห้องแชทให้ */}
      <div className="flex justify-end pl-8">
        <p className="w-fit rounded-2xl rounded-tr-md bg-emerald-500 px-3 py-2 text-[12px] leading-relaxed text-white shadow-sm">
          {cell.label}
        </p>
      </div>

      <div className="flex items-start gap-2 pr-8">
        <div className="mt-0.5 size-6 shrink-0 overflow-hidden rounded-full bg-primary/10">
          {avatar}
        </div>
        <p className="w-fit whitespace-pre-wrap rounded-2xl rounded-tl-md bg-background px-3 py-2 text-[12px] leading-relaxed text-normal shadow-sm">
          {cell.replyText?.trim() || t("preview.noReply")}
        </p>
      </div>
    </>
  );
};

export const MenuCanvas = ({
  menu,
  cells,
  cellList,
  selectedCell,
  issueCount,
  uploading,
  onSelectCell,
  onRename,
  onApplyLayout,
  onPickCellImage,
  onRemoveCellImage,
}: {
  menu: RichMenu;
  cells: number;
  cellList: (CanvasCell & { replyText?: string })[];
  selectedCell: number;
  issueCount: number;
  uploading: boolean;
  onSelectCell: (index: number) => void;
  onRename: (name: string) => void;
  onApplyLayout: (cells: number) => void;
  onPickCellImage: (index: number, file: File) => void;
  onRemoveCellImage: (index: number) => void;
}) => {
  const { t } = useTranslation("richMenu");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const current = cellList[selectedCell];

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Input
            defaultValue={menu.name}
            key={menu.id}
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (next && next !== menu.name) onRename(next);
            }}
            placeholder={t("builder.namePlaceholder")}
            className="h-8 border-0 bg-transparent px-0 text-lg font-semibold text-normal shadow-none focus-visible:ring-0 md:text-lg"
          />
          <p className="mt-1 text-xs text-mini">{t("builder.hint")}</p>
        </div>

        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            issueCount
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {issueCount ? (
            <CircleAlert className="size-3.5" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          {issueCount ? t("builder.issues", { total: issueCount }) : t("builder.ready")}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/50 px-3 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImageUp className="size-4" />
            )}
            {current?.image
              ? t("builder.replaceCell", { index: selectedCell + 1 })
              : t("builder.uploadCell", { index: selectedCell + 1 })}
          </Button>

          {current?.image && (
            <Button
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onRemoveCellImage(selectedCell)}
              className="text-mini"
            >
              <Trash2 className="size-4" />
              {t("builder.remove")}
            </Button>
          )}

          <p className="text-[11px] text-mini">{t("builder.cellImageSpec")}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept={RICH_MENU_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPickCellImage(selectedCell, file);
              // เคลียร์ค่าไว้ เผื่อผู้ใช้เลือกไฟล์เดิมซ้ำ onChange จะได้ยังยิง
              event.target.value = "";
            }}
          />
        </div>

        <LayoutPicker value={cells} onChange={onApplyLayout} />
      </div>

      <PhonePreview
        menu={menu}
        cells={cells}
        cellList={cellList}
        selectedCell={selectedCell}
        onSelectCell={onSelectCell}
      />
    </Card>
  );
};

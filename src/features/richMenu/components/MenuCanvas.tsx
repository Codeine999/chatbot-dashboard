import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  BatteryFull,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  ImageUp,
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
  RICH_MENU_CANVAS,
  RICH_MENU_IMAGE_TYPES,
  RICH_MENU_MAX_IMAGE_MB,
  RICH_MENU_TEMPLATES,
  boundsToPercent,
  getAreaIssueKey,
} from "../layout";
import type { RichMenu, RichMenuArea, RichMenuTemplateId } from "../type";

/** สัญลักษณ์เล็ก ๆ ของเลย์เอาต์ วาดด้วย grid แทนไอคอน จะได้ตรงกับจำนวนช่องจริง */
const LayoutGlyph = ({ cols, rows }: { cols: number; rows: number }) => (
  <span
    className="grid h-3 w-[18px] gap-[2px]"
    style={{
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    }}
  >
    {Array.from({ length: cols * rows }).map((_, index) => (
      <span key={index} className="rounded-[1px] bg-current" />
    ))}
  </span>
);

const LayoutPicker = ({
  value,
  onChange,
}: {
  value: RichMenuTemplateId;
  onChange: (value: RichMenuTemplateId) => void;
}) => {
  const { t } = useTranslation("richMenu");

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
      {RICH_MENU_TEMPLATES.map((template) => (
        <Tooltip key={template.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onChange(template.id)}
              aria-label={t(`layout.${template.id}`)}
              aria-pressed={template.id === value}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors",
                "outline-none focus-visible:ring-[2px] focus-visible:ring-ring/50",
                template.id === value
                  ? "bg-background text-primary shadow-sm"
                  : "text-mini hover:text-normal"
              )}
            >
              <LayoutGlyph cols={template.cols} rows={template.rows} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t(`layout.${template.id}`)}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

const AreaTile = ({
  area,
  hasImage,
  isSelected,
  onSelect,
}: {
  area: RichMenuArea;
  hasImage: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const hasIssue = Boolean(getAreaIssueKey(area));

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={area.label}
      aria-pressed={isSelected}
      style={boundsToPercent(area.bounds)}
      className={cn(
        "absolute flex cursor-pointer items-center justify-center overflow-hidden p-1 text-center transition-colors outline-none",
        "ring-1 ring-inset ring-black/8 dark:ring-white/10",
        hasImage ? "hover:bg-primary/15" : "bg-background/55 hover:bg-background/80",
        isSelected && "z-10 bg-primary/12 ring-2 ring-primary hover:bg-primary/15"
      )}
    >
      {hasImage ? null : (
        <span className="line-clamp-2 text-[11px] leading-tight font-medium text-normal/75">
          {area.label}
        </span>
      )}

      {hasIssue && (
        <span className="absolute right-1 top-1 size-1.5 rounded-full bg-destructive" />
      )}

      {isSelected &&
        ["left-[3px] top-[3px]", "right-[3px] top-[3px]", "left-[3px] bottom-[3px]", "right-[3px] bottom-[3px]"].map(
          (position) => (
            <span
              key={position}
              className={cn("absolute size-1.5 rounded-[1px] bg-primary", position)}
            />
          )
        )}
    </button>
  );
};

/** โครงเครื่องแบบ iPhone ที่มี Dynamic Island — ให้เห็นสัดส่วนจริงตอนเมนูไปอยู่ในห้องแชท */
const PhonePreview = ({
  menu,
  selectedAreaId,
  onSelectArea,
}: {
  menu: RichMenu;
  selectedAreaId: string;
  onSelectArea: (id: string) => void;
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
        {/* ล็อกสัดส่วนจอไว้ให้สูงเท่าเครื่องจริง ห้องแชทจะได้ยืดกินที่ที่เหลือ
            ไม่ใช่ปล่อยให้ rich menu กินความสูงเกือบครึ่งจอเหมือนตอนสูงตามเนื้อหา */}
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
              <p className="truncate text-[12.5px] font-medium text-normal">{accountName}</p>
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

            {/* เว้นขอบขวาไว้ ฟองข้อความจะได้ไม่ยาวชนขอบจอเหมือนข้อความของเราเอง */}
            <div className="flex items-start gap-2 pr-8">
              <div className="mt-0.5 size-6 shrink-0 overflow-hidden rounded-full bg-primary/10">
                {avatar}
              </div>

              <div className="min-w-0">
                <p className="w-fit rounded-2xl rounded-tl-md bg-background px-3 py-2 text-[12px] leading-relaxed text-normal shadow-sm">
                  {t("preview.greeting")}
                </p>
                <p className="mt-1 text-[10px] text-mini">{t("preview.time")}</p>
              </div>
            </div>
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

            {menu.areas.map((area) => (
              <AreaTile
                key={area.id}
                area={area}
                hasImage={Boolean(menu.image)}
                isSelected={area.id === selectedAreaId}
                onSelect={() => onSelectArea(area.id)}
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

export const MenuCanvas = ({
  menu,
  selectedAreaId,
  issueCount,
  onSelectArea,
  onRename,
  onApplyTemplate,
  onPickImage,
  onRemoveImage,
}: {
  menu: RichMenu;
  selectedAreaId: string;
  issueCount: number;
  onSelectArea: (id: string) => void;
  onRename: (name: string) => void;
  onApplyTemplate: (template: RichMenuTemplateId) => void;
  onPickImage: (file: File) => void;
  onRemoveImage: () => void;
}) => {
  const { t } = useTranslation("richMenu");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Input
            value={menu.name}
            onChange={(event) => onRename(event.target.value)}
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
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageUp className="size-4" />
            {menu.image ? t("builder.replace") : t("builder.upload")}
          </Button>

          {menu.image && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveImage}
              className="text-mini"
            >
              <Trash2 className="size-4" />
              {t("builder.remove")}
            </Button>
          )}

          <p className="text-[11px] text-mini">
            {t("builder.imageSpec", {
              width: RICH_MENU_CANVAS.width,
              height: RICH_MENU_CANVAS.height,
              size: RICH_MENU_MAX_IMAGE_MB,
            })}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={RICH_MENU_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPickImage(file);
              // เคลียร์ค่าไว้ เผื่อผู้ใช้เลือกไฟล์เดิมซ้ำ onChange จะได้ยังยิง
              event.target.value = "";
            }}
          />
        </div>

        <LayoutPicker value={menu.template} onChange={onApplyTemplate} />
      </div>

      <PhonePreview
        menu={menu}
        selectedAreaId={selectedAreaId}
        onSelectArea={onSelectArea}
      />
    </Card>
  );
};

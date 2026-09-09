import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, MousePointerClick } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  DISPLAY_TEXT_MAX,
  POSTBACK_DATA_MAX,
  RICH_MENU_CANVAS,
  formatAspectRatio,
  getAreaIssueKey,
} from "../layout";
import { MenuThumbnail } from "./MenuThumbnail";
import type { RichMenu, RichMenuArea, RichMenuActionType } from "../type";

const ACTION_TYPES: RichMenuActionType[] = ["postback", "message", "uri", "none"];

const Field = ({
  label,
  counter,
  children,
}: {
  label: string;
  counter?: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <Label className="text-[11px] font-medium text-mini">{label}</Label>
      {counter && <span className="text-[10px] tabular-nums text-mini">{counter}</span>}
    </div>
    {children}
  </div>
);

const BoundsInput = ({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-[10px] font-medium text-mini">{label}</Label>
    <Input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(event) => {
        const next = Number(event.target.value);
        // ปล่อยค่าติดลบหรือเกินขอบภาพไม่ได้ เพราะ LINE จะปฏิเสธตอน validate
        onChange(Math.min(Math.max(Number.isFinite(next) ? next : 0, 0), max));
      }}
      className="h-8 px-2 text-[12px] tabular-nums"
    />
  </div>
);

export const AreaInspector = ({
  menu,
  area,
  onUpdateArea,
  onUpdateAction,
}: {
  menu: RichMenu;
  area: RichMenuArea;
  onUpdateArea: (id: string, patch: Partial<RichMenuArea>) => void;
  onUpdateAction: (id: string, patch: Partial<RichMenuArea["action"]>) => void;
}) => {
  const { t } = useTranslation("richMenu");

  if (!area) {
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold text-normal">{t("area.title")}</p>
        <div className="mt-6 flex flex-col items-center gap-2 pb-4 text-center">
          <MousePointerClick className="size-5 text-mini" />
          <p className="max-w-[15rem] text-xs leading-relaxed text-mini">
            {t("area.empty")}
          </p>
        </div>
      </Card>
    );
  }

  const { action, bounds } = area;
  const issueKey = getAreaIssueKey(area);

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold text-normal">{t("area.title")}</p>

      <div className="flex items-center gap-3 rounded-xl border bg-background/50 p-2.5">
        <MenuThumbnail menu={menu} highlightAreaId={area.id} className="w-14 shrink-0" />

        <div className="min-w-0 flex-1">
          <Input
            value={area.label}
            onChange={(event) => onUpdateArea(area.id, { label: event.target.value })}
            placeholder={t("area.namePlaceholder")}
            className="h-7 border-0 bg-transparent px-0 text-[13px] font-medium text-normal shadow-none focus-visible:ring-0"
          />
          <p className="truncate text-[11px] text-mini">
            {t("area.size", { width: bounds.width, height: bounds.height })} ·{" "}
            {t("area.ratio", { ratio: formatAspectRatio(bounds.width, bounds.height) })}
          </p>
        </div>
      </div>

      <Field label={t("area.actionType")}>
        <Select
          value={action.type}
          onValueChange={(value) =>
            onUpdateAction(area.id, { type: value as RichMenuActionType })
          }
        >
          <SelectTrigger className="w-full !h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="text-[13px]">
                {t(`action.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {action.type === "postback" && (
        <>
          <Field
            label={t("area.data")}
            counter={`${action.data.length}/${POSTBACK_DATA_MAX}`}
          >
            <Input
              value={action.data}
              maxLength={POSTBACK_DATA_MAX}
              onChange={(event) => onUpdateAction(area.id, { data: event.target.value })}
              placeholder={t("area.dataPlaceholder")}
              className="h-9 text-[13px]"
            />
          </Field>

          <div className="space-y-2.5 rounded-xl border bg-background/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-[12px] font-medium text-normal">
                {t("area.showInChat")}
              </Label>
              <Switch
                checked={action.showInChat}
                onCheckedChange={(checked) =>
                  onUpdateAction(area.id, { showInChat: checked })
                }
                aria-label={t("area.showInChat")}
              />
            </div>

            {action.showInChat ? (
              <Field
                label={t("area.displayText")}
                counter={`${action.text.length}/${DISPLAY_TEXT_MAX}`}
              >
                <Input
                  value={action.text}
                  maxLength={DISPLAY_TEXT_MAX}
                  onChange={(event) =>
                    onUpdateAction(area.id, { text: event.target.value })
                  }
                  placeholder={t("area.displayTextPlaceholder")}
                  className="h-9 text-[13px]"
                />
              </Field>
            ) : (
              <p className="text-[11px] leading-relaxed text-mini">
                {t("area.showInChatHint")}
              </p>
            )}
          </div>
        </>
      )}

      {action.type === "message" && (
        <Field label={t("area.message")}>
          <Input
            value={action.text}
            onChange={(event) => onUpdateAction(area.id, { text: event.target.value })}
            placeholder={t("area.messagePlaceholder")}
            className="h-9 text-[13px]"
          />
        </Field>
      )}

      {action.type === "uri" && (
        <Field label={t("area.uri")}>
          <Input
            value={action.uri}
            onChange={(event) => onUpdateAction(area.id, { uri: event.target.value })}
            placeholder={t("area.uriPlaceholder")}
            className="h-9 text-[13px]"
          />
        </Field>
      )}

      {action.type === "none" && (
        <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-[11px] leading-relaxed text-mini">
          {t("area.noneHint")}
        </p>
      )}

      {issueKey && (
        <p className="flex items-center gap-1.5 text-[11px] text-destructive">
          <CircleAlert className="size-3.5 shrink-0" />
          {t(issueKey)}
        </p>
      )}

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-mini">{t("area.bounds")}</Label>
        <div className="grid grid-cols-4 gap-2">
          <BoundsInput
            label="X"
            value={bounds.x}
            max={RICH_MENU_CANVAS.width - bounds.width}
            onChange={(x) => onUpdateArea(area.id, { bounds: { ...bounds, x } })}
          />
          <BoundsInput
            label="Y"
            value={bounds.y}
            max={RICH_MENU_CANVAS.height - bounds.height}
            onChange={(y) => onUpdateArea(area.id, { bounds: { ...bounds, y } })}
          />
          <BoundsInput
            label="W"
            value={bounds.width}
            max={RICH_MENU_CANVAS.width - bounds.x}
            onChange={(width) => onUpdateArea(area.id, { bounds: { ...bounds, width } })}
          />
          <BoundsInput
            label="H"
            value={bounds.height}
            max={RICH_MENU_CANVAS.height - bounds.y}
            onChange={(height) =>
              onUpdateArea(area.id, { bounds: { ...bounds, height } })
            }
          />
        </div>
      </div>
    </Card>
  );
};

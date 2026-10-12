import { useTranslation } from "react-i18next";
import { CircleAlert, MousePointerClick, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { cellBounds, formatAspectRatio, getCellIssueKey } from "../layout";
import { MenuThumbnail } from "./MenuThumbnail";
import type { RichMenu, RichMenuButton, RichMenuReply } from "../type";
import type { CanvasCell } from "./MenuCanvas";

const NONE_VALUE = "__none__";
const URI_VALUE = "__uri__";
const MESSAGE_VALUE = "__message__";
const SYSTEM_VALUE_PREFIX = "__system__";
const EXISTING_ACTION_VALUE = "__existing_action__";

type SystemIntent = "REGISTER" | "CONTACT_ADMIN";

const SYSTEM_INTENTS: readonly SystemIntent[] = ["REGISTER", "CONTACT_ADMIN"];

const readSystemIntent = (
  button: RichMenuButton
): SystemIntent | undefined => {
  if (button.kind !== "action" || button.action.type !== "postback") {
    return undefined;
  }

  const data = button.action.data;
  if (typeof data !== "string" || !data.startsWith("intent=")) {
    return undefined;
  }

  const intent = data.slice("intent=".length);
  return SYSTEM_INTENTS.find((candidate) => candidate === intent);
};

/**
 * สิ่งที่ช่องหนึ่งช่องทำเมื่อลูกค้ากด
 *
 * ตัวเลือกหลักคือ "ตอบด้วยคำตอบจากคลัง" ซึ่งเป็นทางที่ควรใช้: ข้อความบนปุ่ม
 * และคำตอบมาจากแถวเดียวกัน แก้คำตอบทีหลังได้โดยไม่ต้องเผยแพร่เมนูใหม่
 */
export const CellInspector = ({
  menu,
  cell,
  replies,
  onChangeButton,
  onEditReply,
}: {
  menu: RichMenu;
  cell?: CanvasCell;
  replies: RichMenuReply[];
  onChangeButton: (index: number, button: RichMenuButton) => void;
  onEditReply: (replyKey: string) => void;
}) => {
  const { t } = useTranslation("richMenu");

  if (!cell) {
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold text-normal">{t("cell.title")}</p>
        <div className="mt-6 flex flex-col items-center gap-2 pb-4 text-center">
          <MousePointerClick className="size-5 text-mini" />
          <p className="max-w-[15rem] text-xs leading-relaxed text-mini">
            {t("cell.empty")}
          </p>
        </div>
      </Card>
    );
  }

  const bounds = cellBounds(cell.index, menu.cells);
  const issueKey = getCellIssueKey(cell.button, Boolean(cell.image));
  const systemIntent = readSystemIntent(cell.button);
  const selectValue =
    cell.button.kind === "reply"
      ? cell.button.replyKey
      : cell.button.kind === "uri"
        ? URI_VALUE
        : cell.button.kind === "action"
          ? systemIntent
            ? `${SYSTEM_VALUE_PREFIX}${systemIntent}`
            : cell.button.action.type === "message"
              ? MESSAGE_VALUE
              : EXISTING_ACTION_VALUE
          : NONE_VALUE;

  const onSelect = (value: string) => {
    if (value === EXISTING_ACTION_VALUE) return;
    if (value === NONE_VALUE)
      return onChangeButton(cell.index, { kind: "none" });
    if (value === URI_VALUE)
      return onChangeButton(cell.index, { kind: "uri", uri: "" });
    if (value === MESSAGE_VALUE)
      return onChangeButton(cell.index, {
        kind: "action",
        action: { type: "message", text: "" },
      });
    if (value.startsWith(SYSTEM_VALUE_PREFIX)) {
      const intent = value.slice(SYSTEM_VALUE_PREFIX.length) as SystemIntent;
      const displayText = t(`cell.system.${intent}.displayText`);

      return onChangeButton(cell.index, {
        kind: "action",
        action: {
          type: "postback",
          label: displayText.slice(0, 20),
          data: `intent=${intent}`,
          displayText,
        },
      });
    }

    onChangeButton(cell.index, { kind: "reply", replyKey: value });
  };

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold text-normal">{t("cell.title")}</p>

      <div className="flex items-center gap-3 rounded-xl border bg-background/50 p-2.5">
        <MenuThumbnail
          menu={menu}
          highlightIndex={cell.index}
          className="w-14 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-normal">
            {t("cell.number", { index: cell.index + 1 })}
          </p>
          <p className="truncate text-[11px] text-mini">
            {t("cell.size", { width: bounds.width, height: bounds.height })} ·{" "}
            {t("cell.ratio", {
              ratio: formatAspectRatio(bounds.width, bounds.height),
            })}
          </p>
          <p className="truncate text-[11px] text-mini">
            {cell.image ? t("cell.hasImage") : t("cell.noImage")}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-mini">
          {t("cell.action")}
        </Label>

        <Select value={selectValue} onValueChange={onSelect}>
          <SelectTrigger className="h-9 w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cell.button.kind === "action" &&
              !systemIntent &&
              cell.button.action.type !== "message" && (
                <SelectItem value={EXISTING_ACTION_VALUE}>
                  {cell.button.action.label ?? cell.button.action.type}
                </SelectItem>
              )}
            <SelectItem value={NONE_VALUE}>{t("cell.actionNone")}</SelectItem>
            <SelectItem value={URI_VALUE}>{t("cell.actionUri")}</SelectItem>
            <SelectItem value={MESSAGE_VALUE}>{t("cell.actionMessage")}</SelectItem>
            <SelectItem value={`${SYSTEM_VALUE_PREFIX}REGISTER`}>
              {t("cell.system.REGISTER.label")}
            </SelectItem>
            <SelectItem value={`${SYSTEM_VALUE_PREFIX}CONTACT_ADMIN`}>
              {t("cell.system.CONTACT_ADMIN.label")}
            </SelectItem>
            {replies.map((reply) => (
              <SelectItem key={reply.key} value={reply.key}>
                {reply.label}
                {reply.active ? "" : ` (${t("reply.inactive")})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-[11px] leading-relaxed text-mini">
          {t("cell.actionHint")}
        </p>
      </div>

      {cell.button.kind === "reply" && (
        <div className="space-y-2 rounded-xl border bg-background/50 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-normal">
                {cell.label}
              </p>
              <p className="truncate font-mono text-[10.5px] text-mini">
                menu={cell.button.replyKey}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label={t("reply.edit")}
              className="size-7 shrink-0 text-mini"
              onClick={() =>
                cell.button.kind === "reply" &&
                onEditReply(cell.button.replyKey)
              }
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>

          {cell.missingReply && (
            <p className="flex items-start gap-1.5 text-[11px] text-destructive">
              <CircleAlert className="mt-px size-3.5 shrink-0" />
              {t("cell.missingReply")}
            </p>
          )}
        </div>
      )}

      {cell.button.kind === "uri" && (
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-mini">
            {t("cell.uri")}
          </Label>
          <Input
            value={cell.button.uri}
            onChange={(event) =>
              onChangeButton(cell.index, {
                kind: "uri",
                uri: event.target.value,
              })
            }
            placeholder={t("cell.uriPlaceholder")}
            className="h-9 text-[13px]"
          />
        </div>
      )}

      {cell.button.kind === "action" &&
        cell.button.action.type === "message" && (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-mini">
              {t("cell.message")}
            </Label>
            <Input
              value={
                typeof cell.button.action.text === "string"
                  ? cell.button.action.text
                  : ""
              }
              maxLength={300}
              onChange={(event) => {
                const text = event.target.value;
                onChangeButton(cell.index, {
                  kind: "action",
                  action: {
                    type: "message",
                    label: text.trim().slice(0, 20) || undefined,
                    text,
                  },
                });
              }}
              placeholder={t("cell.messagePlaceholder")}
              className="h-9 text-[13px]"
            />
            <p className="text-[11px] leading-relaxed text-mini">
              {t("cell.messageHint")}
            </p>
          </div>
        )}

      {cell.button.kind === "action" && systemIntent && (
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-mini">
            {t("cell.systemDisplayText")}
          </Label>
          <Input
            value={
              "displayText" in cell.button.action &&
              typeof cell.button.action.displayText === "string"
                ? cell.button.action.displayText
                : ""
            }
            maxLength={300}
            onChange={(event) => {
              const displayText = event.target.value;
              onChangeButton(cell.index, {
                kind: "action",
                action: {
                  type: "postback",
                  label: displayText.trim().slice(0, 20) || undefined,
                  data: `intent=${systemIntent}`,
                  displayText,
                },
              });
            }}
            placeholder={t(`cell.system.${systemIntent}.displayText`)}
            className="h-9 text-[13px]"
          />
          <p className="text-[11px] leading-relaxed text-mini">
            {t("cell.systemHint", { intent: systemIntent })}
          </p>
        </div>
      )}

      {issueKey && (
        <p className="flex items-start gap-1.5 rounded-lg bg-destructive/5 px-2.5 py-2 text-[11px] text-destructive">
          <CircleAlert className="mt-px size-3.5 shrink-0" />
          {t(issueKey)}
        </p>
      )}
    </Card>
  );
};

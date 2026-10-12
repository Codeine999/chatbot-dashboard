import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MessageSquareText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  REPLY_KEY_MAX,
  REPLY_KEY_PATTERN,
  REPLY_LABEL_MAX,
  REPLY_TEXT_MAX,
  suggestReplyKey,
} from "../layout";
import type { RichMenuReply, RichMenuReplyDraft } from "../type";

const emptyDraft = (sortOrder: number): RichMenuReplyDraft => ({
  key: "",
  label: "",
  replyText: "",
  active: true,
  sortOrder,
});

/**
 * คลังคำตอบของร้าน
 *
 * `key` แก้ได้เฉพาะตอนสร้าง เพราะปุ่มที่เผยแพร่ไปแล้วอยู่บนเครื่องลูกค้าและ
 * ส่งค่าเดิมกลับมาตลอด — เปลี่ยนชื่อ key ทีหลังคือทำให้ปุ่มเก่ากดแล้วเงียบ
 * ส่วนข้อความบนปุ่มกับคำตอบแก้เมื่อไหร่ก็ได้ ไม่ต้องเผยแพร่เมนูใหม่
 */
export const ReplyLibrary = ({
  replies,
  loading,
  saving,
  editingKey,
  onCreate,
  onUpdate,
  onDelete,
  onEditingKeyChange,
}: {
  replies: RichMenuReply[];
  loading: boolean;
  saving: boolean;
  editingKey: string | null;
  onCreate: (draft: RichMenuReplyDraft) => void;
  onUpdate: (
    id: string,
    patch: Partial<Omit<RichMenuReplyDraft, "key">>
  ) => void;
  onDelete: (id: string) => void;
  onEditingKeyChange: (key: string | null) => void;
}) => {
  const { t } = useTranslation("richMenu");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft(0));

  // เปิดรายการที่ถูกสั่งแก้จากแผงช่องให้เองอัตโนมัติ
  useEffect(() => {
    if (editingKey) setCreating(false);
  }, [editingKey]);

  const keyError =
    draft.key.trim() !== "" && !REPLY_KEY_PATTERN.test(draft.key.trim());

  const startCreating = () => {
    onEditingKeyChange(null);
    setDraft(emptyDraft(replies.length));
    setCreating(true);
  };

  const submit = () => {
    const label = draft.label.trim();
    const key = (draft.key.trim() || suggestReplyKey(label)).toLowerCase();

    if (!label || !draft.replyText.trim() || !REPLY_KEY_PATTERN.test(key)) return;

    onCreate({ ...draft, key, label });
    setCreating(false);
    setDraft(emptyDraft(replies.length + 1));
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-normal">{t("reply.title")}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mini">
            {t("reply.hint")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={startCreating}
          className="shrink-0"
        >
          <Plus className="size-4" />
          {t("reply.create")}
        </Button>
      </div>

      {creating && (
        <div className="space-y-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label className="text-[11px] font-medium text-mini">
                {t("reply.label")}
              </Label>
              <span className="text-[10px] tabular-nums text-mini">
                {draft.label.length}/{REPLY_LABEL_MAX}
              </span>
            </div>
            <Input
              value={draft.label}
              maxLength={REPLY_LABEL_MAX}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, label: event.target.value }))
              }
              placeholder={t("reply.labelPlaceholder")}
              className="h-9 text-[13px]"
            />
            <p className="text-[10.5px] leading-relaxed text-mini">
              {t("reply.labelHint")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-mini">
              {t("reply.key")}
            </Label>
            <Input
              value={draft.key}
              maxLength={REPLY_KEY_MAX}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  key: event.target.value.toLowerCase(),
                }))
              }
              placeholder={suggestReplyKey(draft.label) || "promo_today"}
              className={cn(
                "h-9 font-mono text-[12px]",
                keyError && "border-destructive"
              )}
            />
            <p
              className={cn(
                "text-[10.5px] leading-relaxed",
                keyError ? "text-destructive" : "text-mini"
              )}
            >
              {keyError ? t("reply.keyInvalid") : t("reply.keyHint")}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label className="text-[11px] font-medium text-mini">
                {t("reply.text")}
              </Label>
              <span className="text-[10px] tabular-nums text-mini">
                {draft.replyText.length}/{REPLY_TEXT_MAX}
              </span>
            </div>
            <textarea
              value={draft.replyText}
              maxLength={REPLY_TEXT_MAX}
              rows={4}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, replyText: event.target.value }))
              }
              placeholder={t("reply.textPlaceholder")}
              className="w-full resize-y rounded-md border bg-background px-3 py-2 text-[13px] leading-relaxed outline-none focus-visible:ring-[2px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreating(false)}
            >
              {t("reply.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={submit}
              disabled={saving || !draft.label.trim() || !draft.replyText.trim()}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {t("reply.save")}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-xs text-mini">{t("reply.loading")}</p>
      ) : replies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MessageSquareText className="size-5 text-mini" />
          <p className="max-w-[16rem] text-xs leading-relaxed text-mini">
            {t("reply.emptyState")}
          </p>
        </div>
      ) : (
        <div className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto">
          {replies.map((reply) => (
            <ReplyRow
              key={reply.id}
              reply={reply}
              expanded={reply.key === editingKey}
              saving={saving}
              onToggle={() =>
                onEditingKeyChange(reply.key === editingKey ? null : reply.key)
              }
              onUpdate={(patch) => onUpdate(reply.id, patch)}
              onDelete={() => onDelete(reply.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const ReplyRow = ({
  reply,
  expanded,
  saving,
  onToggle,
  onUpdate,
  onDelete,
}: {
  reply: RichMenuReply;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Omit<RichMenuReplyDraft, "key">>) => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation("richMenu");
  const [label, setLabel] = useState(reply.label);
  const [replyText, setReplyText] = useState(reply.replyText);

  // ค่าจาก server เปลี่ยนเมื่อไหร่ ช่องกรอกที่ยังไม่ได้แก้ต้องตามไปด้วย
  useEffect(() => {
    setLabel(reply.label);
    setReplyText(reply.replyText);
  }, [reply.label, reply.replyText]);

  const dirty = label !== reply.label || replyText !== reply.replyText;
  const inUse = reply.usedByTemplates.length > 0;

  return (
    <div className="rounded-xl border bg-background/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2 p-2.5 text-left outline-none"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[12.5px] font-medium text-normal">
              {reply.label}
            </span>
            {!reply.active && (
              <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {t("reply.inactive")}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10.5px] text-mini">
            menu={reply.key}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-mini">
            {reply.replyText}
          </span>
        </span>
      </button>

      {expanded && (
        <div className="space-y-2.5 border-t px-2.5 py-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-mini">
              {t("reply.label")}
            </Label>
            <Input
              value={label}
              maxLength={REPLY_LABEL_MAX}
              onChange={(event) => setLabel(event.target.value)}
              className="h-9 text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-mini">
              {t("reply.text")}
            </Label>
            <textarea
              value={replyText}
              maxLength={REPLY_TEXT_MAX}
              rows={4}
              onChange={(event) => setReplyText(event.target.value)}
              className="w-full resize-y rounded-md border bg-background px-3 py-2 text-[13px] leading-relaxed outline-none focus-visible:ring-[2px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label className="flex items-center gap-2 text-[11px] font-medium text-mini">
              <Switch
                checked={reply.active}
                onCheckedChange={(active) => onUpdate({ active })}
              />
              {t("reply.activeLabel")}
            </Label>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("reply.delete")}
                disabled={inUse}
                title={inUse ? t("reply.inUse") : undefined}
                className="size-8 text-mini disabled:opacity-40"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
              </Button>

              <Button
                size="sm"
                disabled={!dirty || saving || !label.trim() || !replyText.trim()}
                onClick={() => onUpdate({ label, replyText })}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {t("reply.save")}
              </Button>
            </div>
          </div>

          {inUse && (
            <p className="text-[10.5px] leading-relaxed text-mini">
              {t("reply.usedBy", {
                names: reply.usedByTemplates
                  .map((template) => template.name)
                  .join(", "),
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

import { useTranslation } from "react-i18next";
import { Check, CircleAlert, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { CHAT_BAR_TEXT_MAX, PUBLISH_STEPS } from "../layout";
import { Segmented } from "./Segmented";
import type { PublishTarget, RichMenu, RichMenuArea } from "../type";

type MenuIssue = { area: RichMenuArea; issueKey: string };

const PublishSteps = ({
  publishing,
  publishStep,
}: {
  publishing: boolean;
  publishStep: number;
}) => {
  const { t } = useTranslation("richMenu");

  return (
    <ol className="space-y-2 rounded-xl border bg-background/50 p-3">
      {PUBLISH_STEPS.map((step, index) => {
        // เผยแพร่จบแล้ว publishing จะเป็น false ทุกขั้นจึงถือว่าผ่าน
        const isDone = !publishing || index < publishStep;
        const isActive = publishing && index === publishStep;

        return (
          <li key={step} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
                isDone
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : isActive
                    ? "text-primary"
                    : "bg-muted text-mini"
              )}
            >
              {isDone ? (
                <Check className="size-2.5" />
              ) : isActive ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
            </span>

            <span
              className={cn(
                "text-[11.5px]",
                isDone || isActive ? "text-normal" : "text-mini"
              )}
            >
              {t(`publish.step.${step}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export const PublishPanel = ({
  menu,
  issues,
  target,
  testUserId,
  publishing,
  publishStep,
  onChatBarTextChange,
  onTargetChange,
  onTestUserIdChange,
  onSelectArea,
}: {
  menu: RichMenu;
  issues: MenuIssue[];
  target: PublishTarget;
  testUserId: string;
  publishing: boolean;
  publishStep: number;
  onChatBarTextChange: (value: string) => void;
  onTargetChange: (value: PublishTarget) => void;
  onTestUserIdChange: (value: string) => void;
  onSelectArea: (id: string) => void;
}) => {
  const { t } = useTranslation("richMenu");

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold text-normal">{t("publish.title")}</p>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label className="text-[11px] font-medium text-mini">
            {t("publish.chatBarText")}
          </Label>
          <span className="text-[10px] tabular-nums text-mini">
            {menu.chatBarText.length}/{CHAT_BAR_TEXT_MAX}
          </span>
        </div>
        <Input
          value={menu.chatBarText}
          maxLength={CHAT_BAR_TEXT_MAX}
          onChange={(event) => onChatBarTextChange(event.target.value)}
          placeholder={t("publish.chatBarPlaceholder")}
          className="h-9 text-[13px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-mini">{t("publish.target")}</Label>
        <Segmented
          value={target}
          onChange={onTargetChange}
          options={[
            { value: "all", label: t("publish.targetAll") },
            { value: "test", label: t("publish.targetTest") },
          ]}
        />
      </div>

      {target === "test" && (
        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-mini">
            {t("publish.testUserId")}
          </Label>
          <Input
            value={testUserId}
            onChange={(event) => onTestUserIdChange(event.target.value)}
            placeholder={t("publish.testUserIdPlaceholder")}
            className="h-9 font-mono text-[12px]"
          />
        </div>
      )}

      {issues.length ? (
        <div className="space-y-1.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
          {issues.map(({ area, issueKey }) => (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectArea(area.id)}
              className="flex w-full cursor-pointer items-start gap-2 text-left text-[11px] text-destructive outline-none hover:underline"
            >
              <CircleAlert className="mt-px size-3.5 shrink-0" />
              <span className="min-w-0">
                <span className="font-medium">{area.label}</span> — {t(issueKey)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-xl bg-emerald-500/8 px-3 py-2.5 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
          <Check className="mt-px size-3.5 shrink-0" />
          {t("publish.ready")}
        </p>
      )}

      {(publishing || publishStep >= 0) && (
        <PublishSteps publishing={publishing} publishStep={publishStep} />
      )}

      {menu.source === "line" && (
        <p className="text-[11px] leading-relaxed text-mini">{t("publish.note")}</p>
      )}
    </Card>
  );
};

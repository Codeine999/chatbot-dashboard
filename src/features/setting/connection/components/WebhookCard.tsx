import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, CircleAlert, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconTile } from "@/components/common/IconTile";
import { DotBadge } from "@/components/common/DotBadge";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 2000;
const STEP_KEYS = ["paste", "enable", "disableAutoReply"] as const;

export const WebhookCard = ({
  url,
  ready,
  needsManual,
  children,
}: {
  /** null จนกว่าจะบันทึก Channel ครั้งแรก เพราะ URL ผูกกับ channel ของร้าน */
  url: string | null;
  /** LINE ทดสอบ webhook ผ่านแล้ว */
  ready: boolean;
  /** ตั้ง webhook อัตโนมัติไม่สำเร็จ ต้องวาง URL เอง */
  needsManual: boolean;
  /** แผงตรวจสถานะ แสดงใต้ URL เมื่อเชื่อมต่อแล้ว */
  children?: ReactNode;
}) => {
  const { t } = useTranslation("settings");
  const [copied, setCopied] = useState(false);
  // ตั้งค่าครบแล้วพับขั้นตอนเก็บไว้ ยังกดเปิดดูซ้ำได้
  const [guideOpen, setGuideOpen] = useState(!ready);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => setGuideOpen(!ready), [ready]);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <IconTile icon={Link2} tone="primary" size="md" />
          <div>
            <h2 className="text-base font-semibold text-normal">
              {t("connection.webhook.title")}
            </h2>
            <p className="mt-0.5 text-sm text-mini">{t("connection.webhook.subtitle")}</p>
          </div>
        </div>

        <DotBadge tone={ready ? "success" : "neutral"}>
          {t(ready ? "connection.webhook.ready" : "connection.webhook.notReady")}
        </DotBadge>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <code
          className={cn(
            "min-w-0 flex-1 truncate rounded-xl bg-hover px-4 py-3 font-mono text-sm",
            url ? "text-normal" : "text-mini"
          )}
        >
          {url ?? t("connection.webhook.empty")}
        </code>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!url}
          onClick={handleCopy}
        >
          {copied ? <Check /> : <Copy />}
          {t(copied ? "connection.webhook.copied" : "connection.webhook.copy")}
        </Button>
      </div>

      {needsManual && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          <CircleAlert className="size-4 shrink-0" />
          {t("connection.webhook.manualNeeded")}
        </div>
      )}

      {children}

      <Collapsible open={guideOpen} onOpenChange={setGuideOpen} className="mt-5">
        <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between gap-2 text-left text-sm font-semibold text-normal">
          {t("connection.webhook.afterCopy")}
          <ChevronDown className="size-4 shrink-0 text-mini transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ol className="mt-3 flex flex-col gap-3">
            {STEP_KEYS.map((key, index) => (
              <li key={key} className="flex items-start gap-3 text-sm text-normal">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-hover text-xs font-medium text-mini">
                  {index + 1}
                </span>
                <span className="pt-0.5">{t(`connection.webhook.steps.${key}`)}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            <CircleAlert className="size-4 shrink-0" />
            {t("connection.webhook.warning")}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

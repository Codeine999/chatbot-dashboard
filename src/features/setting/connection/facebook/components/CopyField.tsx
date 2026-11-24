import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 2000;

/** ค่าอ่านอย่างเดียว + ปุ่มคัดลอก ใช้กับ Callback URL และ Verify token */
export const CopyField = ({
  label,
  value,
  emptyText,
}: {
  label: string;
  value: string | null;
  emptyText: string;
}) => {
  const { t } = useTranslation("settings");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <code
          className={cn(
            "min-w-0 flex-1 truncate rounded-[10px] border bg-muted/50 px-4 py-2.5 font-mono text-[13px]",
            value ? "text-normal" : "text-mini"
          )}
        >
          {value ?? emptyText}
        </code>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-[10px]"
          disabled={!value}
          aria-label={`${t("connection.webhook.copy")} ${label}`}
          onClick={copy}
        >
          {copied ? <Check /> : <Copy />}
          {t(copied ? "connection.webhook.copied" : "connection.webhook.copy")}
        </Button>
      </div>
    </div>
  );
};

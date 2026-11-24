import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, CircleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DotBadge } from "@/components/common/DotBadge";
import { CopyField } from "./CopyField";

const STEP_KEYS = ["open", "paste", "subscribe"] as const;

export const FacebookWebhookCard = ({
  url,
  verifyToken,
  ready,
  needsManual,
}: {
  /** null จนกว่าจะบันทึก Page ครั้งแรก หรือเมื่อ backend ไม่ได้ตั้ง PUBLIC_API_BASE_URL */
  url: string | null;
  verifyToken: string | null;
  /** backend subscribe Page กับ app สำเร็จแล้ว */
  ready: boolean;
  /** subscribe อัตโนมัติไม่สำเร็จ ต้องไปตั้งใน Meta dashboard เอง */
  needsManual: boolean;
}) => {
  const { t } = useTranslation("settings");
  // ตั้งค่าครบแล้วพับขั้นตอนเก็บไว้ ยังกดเปิดดูซ้ำได้
  const [guideOpen, setGuideOpen] = useState(!ready);

  useEffect(() => setGuideOpen(!ready), [ready]);

  return (
    <Card variant="flat" className="border-t py-8 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">
            {t("connection.facebook.webhook.title")}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {t("connection.facebook.webhook.subtitle")}
          </p>
        </div>

        <DotBadge tone={ready ? "success" : "neutral"}>
          {t(ready ? "connection.facebook.webhook.ready" : "connection.facebook.webhook.notReady")}
        </DotBadge>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <CopyField
          label={t("connection.facebook.webhook.callbackUrl")}
          value={url}
          emptyText={t("connection.facebook.webhook.empty")}
        />
        <CopyField
          label={t("connection.facebook.webhook.verifyToken")}
          value={verifyToken}
          emptyText={t("connection.facebook.webhook.empty")}
        />
      </div>

      {needsManual && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-0 bg-[#f5f2ef] px-4 py-2.5 text-[13px] text-normal dark:bg-white/5">
          <CircleAlert className="size-4 shrink-0 text-[#c2410c]" />
          {t("connection.facebook.webhook.manualNeeded")}
        </div>
      )}

      <Collapsible open={guideOpen} onOpenChange={setGuideOpen} className="mt-5">
        <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between gap-2 text-left text-sm font-semibold text-foreground">
          {t("connection.facebook.webhook.afterCopy")}
          <ChevronDown className="size-4 shrink-0 text-mini transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ol className="mt-3 flex flex-col gap-3">
            {STEP_KEYS.map((key, index) => (
              <li key={key} className="flex items-start gap-3 text-sm text-normal">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="pt-0.5">{t(`connection.facebook.webhook.steps.${key}`)}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-0 bg-[#f5f2ef] px-4 py-2.5 text-[13px] text-normal dark:bg-white/5">
            <CircleAlert className="size-4 shrink-0 text-[#c2410c]" />
            {t("connection.facebook.webhook.warning")}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

import { useTranslation } from "react-i18next";
import { Bot, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AI_TONE_EMOJI, toneKeyOf } from "../constants";
import type { AiEmojiLevel, AiSettingForm } from "../type";

/** อิโมจิท้ายคำตอบจำลอง ให้เห็นความต่างของแต่ละระดับ */
const EMOJI_TAIL: Record<AiEmojiLevel, string> = {
  none: "",
  light: " 🙂",
  normal: " 😊🕘",
};

const Bubble = ({
  from,
  children,
  muted,
}: {
  from: "customer" | "bot";
  children: React.ReactNode;
  muted?: boolean;
}) => (
  <div className={cn("flex", from === "customer" ? "justify-end" : "justify-start gap-2")}>
    {from === "bot" && (
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-hidden
      >
        <Bot className="size-3.5" />
      </span>
    )}
    <p
      className={cn(
        "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
        from === "customer"
          ? "rounded-br-md bg-primary text-primary-foreground"
          : "rounded-tl-md border bg-card text-normal",
        muted && "italic text-mini"
      )}
    >
      {children}
    </p>
  </div>
);

/**
 * ภาพจำลองว่าค่าที่ตั้งจะทำให้ AI ตอบออกมาประมาณไหน
 * สร้างจากข้อความตัวอย่างฝั่ง client ล้วน ไม่เรียก AI จึงไม่เสีย credit
 */
export const AiPreviewCard = ({ form }: { form: AiSettingForm }) => {
  const { t } = useTranslation("settings");
  const toneKey = toneKeyOf(form.tone);
  const { targetLength, emojiLevel } = form.responseStyle;

  const reply =
    (toneKey ? t(`aiSetting.preview.opener.${toneKey}`) : "") +
    t(`aiSetting.preview.answer.${targetLength}`) +
    EMOJI_TAIL[emojiLevel];

  const traits = [
    toneKey && `${AI_TONE_EMOJI[toneKey]} ${t(`aiSetting.tone.${toneKey}`)}`,
    t(`aiSetting.targetLength.${targetLength}`),
    `${t("aiSetting.config.emojiLevel")}: ${t(`aiSetting.emojiLevel.${emojiLevel}`)}`,
    t("aiSetting.preview.skillsActive", { count: form.skills.length }),
  ].filter(Boolean) as string[];

  const fallback = form.fallbackMessage.trim();

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden
        >
          <Eye className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-normal">{t("aiSetting.preview.title")}</h2>
          <p className="mt-0.5 text-xs text-mini">{t("aiSetting.preview.subtitle")}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-mini">{t("aiSetting.preview.summary")}</p>
        <ul className="flex flex-wrap gap-1.5">
          {traits.map((trait) => (
            <li key={trait} className="rounded-full border bg-card/70 px-2.5 py-1 text-xs text-normal">
              {trait}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="mt-4 flex flex-col gap-2.5 rounded-xl bg-hover/60 p-3"
        aria-live="polite"
      >
        <Bubble from="customer">{t("aiSetting.preview.question")}</Bubble>
        <Bubble from="bot">{reply}</Bubble>

        <p className="pt-2 text-center text-[11px] font-medium text-mini">
          {t("aiSetting.preview.fallbackLabel")}
        </p>
        <Bubble from="customer">{t("aiSetting.preview.fallbackQuestion")}</Bubble>
        <Bubble from="bot" muted={!fallback}>
          {fallback || t("aiSetting.preview.noFallback")}
        </Bubble>
      </div>
    </Card>
  );
};

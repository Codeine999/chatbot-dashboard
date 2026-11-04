import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ConfigSection } from "./ConfigSection";
import { OptionGrid } from "./OptionGrid";
import { SettingField } from "./SettingField";
import {
  AI_EMOJI_LEVELS,
  AI_TARGET_LENGTHS,
  AI_TONE_EMOJI,
  AI_TONES,
  TONE_MAX,
  isPresetTone,
  toneKeyOf,
  type AiToneKey,
} from "../constants";
import type { AiResponseStyle } from "../type";

type Props = {
  tone: string;
  responseStyle: AiResponseStyle;
  onChangeTone: (next: string) => void;
  onChangeResponseStyle: (next: AiResponseStyle) => void;
};

const TONE_KEYS: AiToneKey[] = [
  ...AI_TONES.map((tone) => tone.toLowerCase() as AiToneKey),
  "custom",
];

export const StyleSection = ({ tone, responseStyle, onChangeTone, onChangeResponseStyle }: Props) => {
  const { t } = useTranslation("settings");
  // เลือก "กำหนดเอง" ตอน tone ยังว่าง ต้องจำไว้เอง เพราะดูจากค่า tone อย่างเดียวไม่ได้
  const [customPicked, setCustomPicked] = useState(false);

  const toneKey: AiToneKey | null =
    toneKeyOf(tone) ?? (customPicked && !isPresetTone(tone) ? "custom" : null);

  const pickTone = (key: AiToneKey) => {
    if (key === "custom") {
      setCustomPicked(true);
      // เปลี่ยนจาก preset มาเขียนเอง เริ่มจากช่องว่าง (preset เป็นแค่ key ภาษาอังกฤษ)
      if (isPresetTone(tone)) onChangeTone("");
      return;
    }
    setCustomPicked(false);
    // tone ส่งขึ้น API ตรง ๆ จึงเก็บ preset เป็นภาษาอังกฤษเสมอ
    onChangeTone(AI_TONES.find((preset) => preset.toLowerCase() === key) ?? "");
  };

  return (
    <ConfigSection
      icon={SlidersHorizontal}
      title={t("aiSetting.sections.style.title")}
      subtitle={t("aiSetting.sections.style.subtitle")}
    >
      <div className="flex flex-col gap-5">
        <OptionGrid
          label={t("aiSetting.config.tone")}
          value={toneKey}
          onChange={pickTone}
          className="grid-cols-2 sm:grid-cols-3"
          options={TONE_KEYS.map((key) => ({
            value: key,
            leading: AI_TONE_EMOJI[key],
            label: t(`aiSetting.tone.${key}`),
            description: t(`aiSetting.toneHint.${key}`),
          }))}
        />

        {toneKey === "custom" && (
          <SettingField
            label={t("aiSetting.tone.custom")}
            hint={t("aiSetting.config.toneCustomHint")}
            counter={`${tone.length}/${TONE_MAX}`}
          >
            <Textarea
              value={tone}
              maxLength={TONE_MAX}
              autoFocus={customPicked && !tone}
              onChange={(event) => onChangeTone(event.target.value)}
              placeholder={t("aiSetting.config.toneCustomPlaceholder")}
              className="min-h-20 resize-none"
            />
          </SettingField>
        )}

        <div className="grid gap-5 xl:grid-cols-2">
          <OptionGrid
            label={t("aiSetting.config.responseStyle")}
            value={responseStyle.targetLength}
            onChange={(targetLength) => onChangeResponseStyle({ ...responseStyle, targetLength })}
            className="grid-cols-3"
            options={AI_TARGET_LENGTHS.map((value) => ({
              value,
              label: t(`aiSetting.targetLength.${value}`),
              description: t(`aiSetting.targetLengthHint.${value}`),
            }))}
          />

          <OptionGrid
            label={t("aiSetting.config.emojiLevel")}
            value={responseStyle.emojiLevel}
            onChange={(emojiLevel) => onChangeResponseStyle({ ...responseStyle, emojiLevel })}
            className="grid-cols-3"
            options={AI_EMOJI_LEVELS.map((value) => ({
              value,
              label: t(`aiSetting.emojiLevel.${value}`),
              description: t(`aiSetting.emojiSample.${value}`),
            }))}
          />
        </div>
      </div>
    </ConfigSection>
  );
};

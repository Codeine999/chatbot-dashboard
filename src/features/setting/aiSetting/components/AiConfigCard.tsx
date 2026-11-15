import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingField, SettingSection } from "./SettingField";
import { SkillsEditor } from "./SkillsEditor";
import {
  AI_EMOJI_LEVELS,
  AI_TARGET_LENGTHS,
  AI_TONES,
  FALLBACK_MESSAGE_MAX,
  OWNER_PROMPT_MAX,
} from "../constants";
import type {
  AiEmojiLevel,
  AiResponseStyle,
  AiSkill,
  AiTargetLength,
} from "../type";

type Props = {
  ownerPrompt: string;
  tone: string;
  skills: AiSkill[];
  responseStyle: AiResponseStyle;
  fallbackMessage: string;
  onChangeOwnerPrompt: (next: string) => void;
  onChangeTone: (next: string) => void;
  onChangeSkills: (next: AiSkill[]) => void;
  onChangeResponseStyle: (next: AiResponseStyle) => void;
  onChangeFallbackMessage: (next: string) => void;
};

export const AiConfigCard = ({
  ownerPrompt,
  tone,
  skills,
  responseStyle,
  fallbackMessage,
  onChangeOwnerPrompt,
  onChangeTone,
  onChangeSkills,
  onChangeResponseStyle,
  onChangeFallbackMessage,
}: Props) => {
  const { t } = useTranslation("settings");

  const seg = (active: boolean) =>
    `h-[34px] flex-1 cursor-pointer rounded-lg border px-3 text-[13px] transition-colors ${
      active
        ? "border-primary bg-primary font-medium text-primary-foreground"
        : "text-normal hover:bg-muted"
    }`;

  return (
    <>
      <SettingSection
        title={t("aiSetting.section.personaTitle")}
        description={t("aiSetting.section.personaDesc")}
      >
        <SettingField
          label={t("aiSetting.config.ownerPrompt")}
          hint={t("aiSetting.config.ownerPromptHint")}
          counter={`${ownerPrompt.length} / ${OWNER_PROMPT_MAX}`}
        >
          <Textarea
            value={ownerPrompt}
            maxLength={OWNER_PROMPT_MAX}
            onChange={(event) => onChangeOwnerPrompt(event.target.value)}
            placeholder={t("aiSetting.config.ownerPromptPlaceholder")}
            rows={9}
            className="field-sizing-fixed min-h-0 resize-none rounded-xl text-sm leading-[1.65]"
          />
        </SettingField>

        <SettingField label={t("aiSetting.config.tone")} hint={t("aiSetting.config.toneHint")}>
          {/* ค่า tone ถูกส่งขึ้น API ตรง ๆ จึงเก็บเป็นภาษาอังกฤษเสมอ */}
          <Select value={tone} onValueChange={onChangeTone}>
            <SelectTrigger className="w-full !h-[42px] rounded-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tone && !(AI_TONES as readonly string[]).includes(tone) && (
                <SelectItem value={tone}>{tone}</SelectItem>
              )}
              {AI_TONES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`aiSetting.tone.${value.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingField>

        <SettingField
          label={t("aiSetting.config.responseStyle")}
          hint={t("aiSetting.config.responseStyleHint")}
        >
          <div className="flex gap-2" role="radiogroup">
            {AI_TARGET_LENGTHS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={responseStyle.targetLength === value}
                className={seg(responseStyle.targetLength === value)}
                onClick={() =>
                  onChangeResponseStyle({ ...responseStyle, targetLength: value as AiTargetLength })
                }
              >
                {t(`aiSetting.targetLength.${value}`)}
              </button>
            ))}
          </div>
        </SettingField>

        <SettingField
          label={t("aiSetting.config.emojiLevel")}
          hint={t("aiSetting.config.emojiLevelHint")}
        >
          <div className="flex gap-2" role="radiogroup">
            {AI_EMOJI_LEVELS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={responseStyle.emojiLevel === value}
                className={seg(responseStyle.emojiLevel === value)}
                onClick={() =>
                  onChangeResponseStyle({ ...responseStyle, emojiLevel: value as AiEmojiLevel })
                }
              >
                {t(`aiSetting.emojiLevel.${value}`)}
              </button>
            ))}
          </div>
        </SettingField>
      </SettingSection>

      <SettingSection
        title={t("aiSetting.section.skillsTitle")}
        description={t("aiSetting.section.skillsDesc")}
        note={t("aiSetting.section.skillsNote", { count: skills.length })}
      >
        <SkillsEditor skills={skills} onChange={onChangeSkills} />
      </SettingSection>

      <SettingSection
        title={t("aiSetting.section.fallbackTitle")}
        description={t("aiSetting.section.fallbackDesc")}
      >
        <SettingField
          label={t("aiSetting.config.fallback")}
          hint={t("aiSetting.config.fallbackHint")}
          counter={`${fallbackMessage.length} / ${FALLBACK_MESSAGE_MAX}`}
        >
          <Textarea
            value={fallbackMessage}
            maxLength={FALLBACK_MESSAGE_MAX}
            onChange={(event) => onChangeFallbackMessage(event.target.value)}
            placeholder={t("aiSetting.config.fallbackPlaceholder")}
            rows={3}
            className="field-sizing-fixed min-h-0 resize-none rounded-xl text-sm leading-[1.65]"
          />
        </SettingField>
      </SettingSection>
    </>
  );
};

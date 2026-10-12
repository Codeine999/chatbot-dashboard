import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingField } from "./SettingField";
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

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-normal">
              {t("aiSetting.config.title")}
            </p>
            <p className="mt-0.5 text-xs text-mini">{t("aiSetting.config.subtitle")}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <SettingField
            label={t("aiSetting.config.ownerPrompt")}
            hint={t("aiSetting.config.ownerPromptHint")}
            counter={`${ownerPrompt.length}/${OWNER_PROMPT_MAX}`}
          >
            <Textarea
              value={ownerPrompt}
              maxLength={OWNER_PROMPT_MAX}
              onChange={(event) => onChangeOwnerPrompt(event.target.value)}
              placeholder={t("aiSetting.config.ownerPromptPlaceholder")}
              className="min-h-24 resize-none"
            />
          </SettingField>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingField
              label={t("aiSetting.config.tone")}
              hint={t("aiSetting.config.toneHint")}
            >
              {/* ค่า tone ถูกส่งขึ้น API ตรง ๆ จึงเก็บเป็นภาษาอังกฤษเสมอ */}
              <Select value={tone} onValueChange={onChangeTone}>
                <SelectTrigger className="w-full !h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Select
                value={responseStyle.targetLength}
                onValueChange={(value) =>
                  onChangeResponseStyle({
                    ...responseStyle,
                    targetLength: value as AiTargetLength,
                  })
                }
              >
                <SelectTrigger className="w-full !h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_TARGET_LENGTHS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`aiSetting.targetLength.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>

            <SettingField
              label={t("aiSetting.config.emojiLevel")}
              hint={t("aiSetting.config.emojiLevelHint")}
            >
              <Select
                value={responseStyle.emojiLevel}
                onValueChange={(value) =>
                  onChangeResponseStyle({
                    ...responseStyle,
                    emojiLevel: value as AiEmojiLevel,
                  })
                }
              >
                <SelectTrigger className="w-full !h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_EMOJI_LEVELS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`aiSetting.emojiLevel.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>
          </div>

          <SettingField
            label={t("aiSetting.config.skills")}
            topHint={t("aiSetting.config.skillsHint")}
          >
            <SkillsEditor skills={skills} onChange={onChangeSkills} />
          </SettingField>

          <SettingField
            label={t("aiSetting.config.fallback")}
            hint={t("aiSetting.config.fallbackHint")}
            counter={`${fallbackMessage.length}/${FALLBACK_MESSAGE_MAX}`}
          >
            <Textarea
              value={fallbackMessage}
              maxLength={FALLBACK_MESSAGE_MAX}
              onChange={(event) => onChangeFallbackMessage(event.target.value)}
              placeholder={t("aiSetting.config.fallbackPlaceholder")}
              className="min-h-24 resize-none"
            />
          </SettingField>
        </div>
      </CardContent>
    </Card>
  );
};

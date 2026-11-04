import { useTranslation } from "react-i18next";
import { LifeBuoy, UserRound } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ConfigSection } from "./ConfigSection";
import { SettingField } from "./SettingField";
import { FALLBACK_MESSAGE_MAX, OWNER_PROMPT_MAX } from "../constants";

export const PersonaSection = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) => {
  const { t } = useTranslation("settings");

  return (
    <ConfigSection
      icon={UserRound}
      title={t("aiSetting.sections.persona.title")}
      subtitle={t("aiSetting.sections.persona.subtitle")}
    >
      <SettingField
        label={t("aiSetting.config.ownerPrompt")}
        hint={t("aiSetting.config.ownerPromptHint")}
        counter={`${value.length}/${OWNER_PROMPT_MAX}`}
      >
        <Textarea
          value={value}
          maxLength={OWNER_PROMPT_MAX}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("aiSetting.config.ownerPromptPlaceholder")}
          className="min-h-28 resize-none leading-relaxed"
        />
      </SettingField>
    </ConfigSection>
  );
};

export const FallbackSection = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) => {
  const { t } = useTranslation("settings");

  return (
    <ConfigSection
      icon={LifeBuoy}
      title={t("aiSetting.sections.fallback.title")}
      subtitle={t("aiSetting.sections.fallback.subtitle")}
    >
      <SettingField
        label={t("aiSetting.sections.fallback.title")}
        hint={t("aiSetting.config.fallbackHint")}
        counter={`${value.length}/${FALLBACK_MESSAGE_MAX}`}
      >
        <Textarea
          value={value}
          maxLength={FALLBACK_MESSAGE_MAX}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("aiSetting.config.fallbackPlaceholder")}
          className="min-h-20 resize-none"
        />
      </SettingField>
    </ConfigSection>
  );
};

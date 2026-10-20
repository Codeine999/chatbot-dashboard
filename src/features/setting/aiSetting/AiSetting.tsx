import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiModelCard } from "./components/AiModelCard";
import { AiConfigCard } from "./components/AiConfigCard";
import { aiSettingMock } from "./mock/aiSetting.mock";
import type { AiSettingForm } from "./type";

export const AiSetting = () => {
  const { t } = useTranslation("settings");
  // ค่าเริ่มต้นมาจาก mock ไปก่อน ยังไม่ได้ต่อ /api/admin/ai-settings
  const [saved, setSaved] = useState<AiSettingForm>(aiSettingMock);
  const [form, setForm] = useState<AiSettingForm>(aiSettingMock);

  const set = <K extends keyof AiSettingForm>(key: K, value: AiSettingForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved]
  );

  // ทุก skill ต้องมีทั้งชื่อและ prompt ตาม schema ฝั่ง backend
  const isValid = form.skills.every(
    (skill) => skill.name.trim() && skill.prompt.trim()
  );

  const handleSave = () => setSaved(form);

  return (
    <div className="mt-6 mb-12 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings2 className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-normal">{t("aiSetting.title")}</h1>
          <p className="text-sm text-mini">{t("aiSetting.subtitle")}</p>
        </div>
      </div>

      <AiModelCard />

      <AiConfigCard
        ownerPrompt={form.ownerPrompt}
        tone={form.tone}
        skills={form.skills}
        responseStyle={form.responseStyle}
        fallbackMessage={form.fallbackMessage}
        onChangeOwnerPrompt={(value) => set("ownerPrompt", value)}
        onChangeTone={(value) => set("tone", value)}
        onChangeSkills={(value) => set("skills", value)}
        onChangeResponseStyle={(value) => set("responseStyle", value)}
        onChangeFallbackMessage={(value) => set("fallbackMessage", value)}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          className="border"
          disabled={!isDirty}
          onClick={() => setForm(saved)}
        >
          {t("aiSetting.cancel")}
        </Button>
        <Button disabled={!isDirty || !isValid} onClick={handleSave}>
          {t("aiSetting.save")}
        </Button>
      </div>
    </div>
  );
};

export default AiSetting;

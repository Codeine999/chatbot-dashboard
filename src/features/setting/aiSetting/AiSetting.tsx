import { useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { AiModelCard } from "./components/AiModelCard";
import { AiConfigCard } from "./components/AiConfigCard";
import {
  pickActiveSetting,
  recordToForm,
  useAiSettings,
  useSaveAiSetting,
} from "./hooks/useAiSetting";
import type { AiSettingForm, AiSettingRecord } from "./type";

/** ฟอร์มเริ่มจากค่าของ record ที่โหลดมา (ใส่ key ที่ผู้เรียกเพื่อรีเซ็ตเมื่อข้อมูลเปลี่ยน) */
const AiSettingEditor = ({ record }: { record?: AiSettingRecord }) => {
  const { t } = useTranslation("settings");
  const saved = useMemo(() => recordToForm(record), [record]);
  const [form, setForm] = useState<AiSettingForm>(saved);
  const save = useSaveAiSetting(record);

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

  return (
    <>
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
          disabled={!isDirty || save.isPending}
          onClick={() => setForm(saved)}
        >
          {t("aiSetting.cancel")}
        </Button>
        <Button
          disabled={!isDirty || !isValid || save.isPending}
          onClick={() => save.mutate(form)}
        >
          {save.isPending && <LoaderCircle className="size-4 animate-spin" />}
          {t("aiSetting.save")}
        </Button>
      </div>
    </>
  );
};

export const AiSetting = () => {
  const { t } = useTranslation("settings");
  const user = useAuthUser();
  const settings = useAiSettings();
  const record = pickActiveSetting(settings.data ?? []);

  return (
    <PageContainer className="flex flex-col gap-4">
      <PageHeader title={t("aiSetting.title")} subtitle={t("aiSetting.subtitle")} />

      {/* การ์ดโมเดลแสดงเฉพาะ dev */}
      {user?.role === "dev" && <AiModelCard />}

      {settings.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {t("aiSetting.loading")}
        </p>
      ) : settings.isError ? (
        <div role="alert" className="flex items-center gap-3 text-sm text-destructive">
          <span>{t("aiSetting.loadError")}</span>
          <Button variant="outline" size="sm" onClick={() => void settings.refetch()}>
            {t("aiSetting.retry")}
          </Button>
        </div>
      ) : (
        <AiSettingEditor key={`${record?.id}:${record?.updatedAt}`} record={record} />
      )}
    </PageContainer>
  );
};

export default AiSetting;

import { useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common/PageContainer";
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
const AiSettingEditor = ({ record, isDev }: { record?: AiSettingRecord; isDev: boolean }) => {
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
      <div className="sticky top-0 z-10 -mx-4 flex min-h-14 flex-wrap items-center justify-end gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
        {isDirty && (
          <span className="mr-auto flex items-center gap-2 text-[13px] text-muted-foreground sm:mr-0">
            <span className="size-1.5 rounded-full bg-[#ea580c]" />
            {t("aiSetting.unsaved")}
          </span>
        )}
        <Button
          variant="outline"
          className="h-[38px] rounded-[10px]"
          disabled={!isDirty || save.isPending}
          onClick={() => setForm(saved)}
        >
          {t("aiSetting.cancel")}
        </Button>
        <Button
          className="h-[38px] rounded-[10px] bg-foreground text-background hover:bg-foreground/90"
          disabled={!isDirty || !isValid || save.isPending}
          onClick={() => save.mutate(form)}
        >
          {save.isPending && <LoaderCircle className="size-4 animate-spin" />}
          {t("aiSetting.save")}
        </Button>
      </div>

      <div className="mx-auto max-w-[1080px] pt-10 pb-20">
        <PageTitle />
        <div className="mt-8">
          {/* การ์ดโมเดลแสดงเฉพาะ dev */}
          {isDev && <AiModelCard />}
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
        </div>
      </div>
    </>
  );
};

const PageTitle = () => {
  const { t } = useTranslation("settings");
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">
        {t("aiSetting.title")}
      </h1>
      <p className="mt-1.5 text-sm text-normal">{t("aiSetting.subtitle")}</p>
    </div>
  );
};

export const AiSetting = () => {
  const { t } = useTranslation("settings");
  const user = useAuthUser();
  const settings = useAiSettings();
  const record = pickActiveSetting(settings.data ?? []);

  return (
    <PageContainer className="pt-0">
      {settings.isLoading ? (
        <div className="mx-auto max-w-[1080px] pt-10">
          <PageTitle />
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {t("aiSetting.loading")}
          </p>
        </div>
      ) : settings.isError ? (
        <div className="mx-auto max-w-[1080px] pt-10">
          <PageTitle />
          <div role="alert" className="mt-8 flex items-center gap-3 text-sm text-destructive">
            <span>{t("aiSetting.loadError")}</span>
            <Button variant="outline" size="sm" onClick={() => void settings.refetch()}>
              {t("aiSetting.retry")}
            </Button>
          </div>
        </div>
      ) : (
        <AiSettingEditor
          key={`${record?.id}:${record?.updatedAt}`}
          record={record}
          isDev={user?.role === "dev"}
        />
      )}
    </PageContainer>
  );
};

export default AiSetting;

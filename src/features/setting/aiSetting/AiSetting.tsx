import { useMemo, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DotBadge } from "@/components/common/DotBadge";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { cn } from "@/lib/utils";
import { AiModelCard } from "./components/AiModelCard";
import { FallbackSection, PersonaSection } from "./components/AiConfigSections";
import { AiPreviewCard } from "./components/AiPreviewCard";
import { SkillsEditor } from "./components/SkillsEditor";
import { StyleSection } from "./components/StyleSection";
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
  const user = useAuthUser();
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
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* การ์ดโมเดลแสดงเฉพาะ dev */}
          {user?.role === "dev" && <AiModelCard />}
          <PersonaSection value={form.ownerPrompt} onChange={(value) => set("ownerPrompt", value)} />
          <StyleSection
            tone={form.tone}
            responseStyle={form.responseStyle}
            onChangeTone={(value) => set("tone", value)}
            onChangeResponseStyle={(value) => set("responseStyle", value)}
          />
          <SkillsEditor skills={form.skills} onChange={(value) => set("skills", value)} />
          <FallbackSection
            value={form.fallbackMessage}
            onChange={(value) => set("fallbackMessage", value)}
          />
        </div>

        <aside className="lg:sticky lg:top-4">
          <AiPreviewCard form={form} />
        </aside>
      </div>

      {/* แถบบันทึกติดล่างจอ เห็นสถานะการเปลี่ยนแปลงตลอดตอนเลื่อนแก้ */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/90 px-4 py-3 shadow-[0_8px_30px_rgba(73,77,122,0.12)] backdrop-blur">
        <p
          className={cn(
            "flex items-center gap-2 text-sm",
            !isValid ? "text-amber-600" : isDirty ? "text-normal" : "text-mini"
          )}
        >
          {!isValid ? (
            <CircleAlert className="size-4" />
          ) : (
            <span
              className={cn("size-2 rounded-full", isDirty ? "bg-amber-500" : "bg-green-500")}
              aria-hidden
            />
          )}
          {!isValid
            ? t("aiSetting.invalidSkills")
            : isDirty
              ? t("aiSetting.unsaved")
              : t("aiSetting.upToDate")}
        </p>
        <div className="flex items-center gap-2">
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
      </div>
    </>
  );
};

export const AiSetting = () => {
  const { t } = useTranslation("settings");
  const settings = useAiSettings();
  const record = pickActiveSetting(settings.data ?? []);

  return (
    <PageContainer className="flex flex-col gap-4">
      <PageHeader
        title={t("aiSetting.title")}
        subtitle={t("aiSetting.subtitle")}
        actions={
          settings.isSuccess &&
          (record ? (
            <>
              <DotBadge tone="success">{t("aiSetting.status.active")}</DotBadge>
              <span className="text-xs text-mini">
                {t("aiSetting.status.version", { version: record.promptVersion })}
              </span>
            </>
          ) : (
            <DotBadge tone="neutral">{t("aiSetting.status.draft")}</DotBadge>
          ))
        }
      />

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

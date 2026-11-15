import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { SwitchField } from "@/components/common/SwitchField";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/features/auth/store/auth.store";
import { useChatPipeline, useSetChatPipeline } from "./hooks/useChatPipeline";
import { useClearAllSessions } from "./hooks/useClearAllSessions";

export const ClearSession = () => {
  const { t } = useTranslation("settings");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clearAll = useClearAllSessions();
  // สวิตช์ปิด AI ตอบกลับ แสดงเฉพาะ role dev
  const isDev = useAuthUser()?.role === "dev";
  const pipeline = useChatPipeline(isDev);
  const setPipeline = useSetChatPipeline();

  const handleConfirm = () => {
    clearAll.mutate(undefined, {
      onSettled: () => setConfirmOpen(false),
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title={t("clearSession.title")}
        subtitle={t("clearSession.subtitle")}
        actions={
          <Button onClick={() => setConfirmOpen(true)} disabled={clearAll.isPending}>
            {clearAll.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("clearSession.action")}
          </Button>
        }
      />

      {isDev && (
        <SectionCard title={t("clearSession.pipeline.title")} className="mt-6">
          <SwitchField
            label={t("clearSession.pipeline.label")}
            description={t("clearSession.pipeline.description")}
            checked={pipeline.data?.paused ?? false}
            disabled={!pipeline.data || setPipeline.isPending}
            onCheckedChange={(paused) => setPipeline.mutate(paused)}
          />
          {pipeline.isError && (
            <p className="mt-3 text-xs text-destructive">{t("clearSession.pipeline.loadFailed")}</p>
          )}
        </SectionCard>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("clearSession.confirm.title")}
        description={t("clearSession.confirm.description")}
        confirmLabel={t("clearSession.action")}
        destructive
        isPending={clearAll.isPending}
        onConfirm={handleConfirm}
      />
    </PageContainer>
  );
};

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useClearAllSessions } from "./hooks/useClearAllSessions";

export const ClearSession = () => {
  const { t } = useTranslation("settings");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clearAll = useClearAllSessions();

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

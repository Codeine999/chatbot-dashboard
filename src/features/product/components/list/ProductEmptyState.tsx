import { FileSpreadsheet, Package, Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ActionTile } from "@/components/common/ActionTile";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";

type Props = {
  onAddManually: () => void;
  onImportFile: () => void;
  onSyncStore: () => void;
};

/** หน้าแรกของร้านที่ยังไม่มีสินค้าเลย พาไปสามทางเริ่มต้น */
export const ProductEmptyState = ({ onAddManually, onImportFile, onSyncStore }: Props) => {
  const { t } = useTranslation("product");

  return (
    <Card>
      <EmptyState icon={Package} title={t("empty.title")} description={t("empty.description")}>
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          <ActionTile
            icon={Plus}
            tone="primary"
            title={t("empty.manual")}
            description={t("empty.manualHint")}
            onClick={onAddManually}
          />
          <ActionTile
            icon={FileSpreadsheet}
            tone="info"
            title={t("empty.file")}
            description={t("empty.fileHint")}
            onClick={onImportFile}
          />
          <ActionTile
            icon={RefreshCw}
            tone="success"
            title={t("empty.sync")}
            description={t("empty.syncHint")}
            onClick={onSyncStore}
          />
        </div>
      </EmptyState>
    </Card>
  );
};

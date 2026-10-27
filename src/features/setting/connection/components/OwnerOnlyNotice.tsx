import { useTranslation } from "react-i18next";
import { LockKeyhole } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

/** แสดงแทนฟอร์มเมื่อผู้ใช้ไม่ใช่ owner เพราะ backend อนุญาตเฉพาะ owner เชื่อม LINE */
export const OwnerOnlyNotice = () => {
  const { t } = useTranslation("settings");

  return (
    <EmptyState
      icon={LockKeyhole}
      title={t("connection.ownerOnly.title")}
      description={t("connection.ownerOnly.description")}
    />
  );
};

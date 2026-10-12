import { useTranslation } from "react-i18next";
import { Languages, Monitor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/context/themeProvider";
import { useLanguage } from "@/i18n/useLanguage";
import type { Language } from "@/i18n/config";

/** หนึ่งแถวของการตั้งค่า ไอคอน + ชื่อ + คำอธิบาย ทางซ้าย ตัวเลือกทางขวา */
const SettingRow = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="flex min-w-0 items-start gap-3">
      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-normal">{title}</p>
        <p className="mt-1 text-xs text-mini">{description}</p>
      </div>
    </div>

    {children}
  </div>
);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * ป็อปอัปตั้งค่าที่เปิดจากเมนูผู้ใช้บน navbar
 *
 * ย้ายปุ่มเปลี่ยนภาษากับปุ่มสลับธีมออกจาก navbar มารวมไว้ที่เดียว
 * ตรรกะเดิมทั้งหมด (useLanguage / useTheme) ใช้ของเดิม เปลี่ยนแค่ที่อยู่
 */
export const SettingsDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation("settings");
  const { language, setLanguage, languages, labels } = useLanguage();
  const { theme, setTheme } = useTheme();

  // ปุ่มเดิมบน navbar สลับแค่สองค่า ค่า system จึงถือเป็น dark เหมือนที่ไอคอนเดิมทำ
  const themeValue = theme === "dark" ? "dark" : "light";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <SettingRow
            icon={Languages}
            title={t("language.title")}
            description={t("language.subtitle")}
          >
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger className="w-full !h-10 shrink-0 sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((code) => (
                  <SelectItem key={code} value={code}>
                    {labels[code].native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            icon={Monitor}
            title={t("dialog.theme.title")}
            description={t("dialog.theme.subtitle")}
          >
            <Select
              value={themeValue}
              onValueChange={(value) => setTheme(value as "light" | "dark")}
            >
              <SelectTrigger className="w-full !h-10 shrink-0 sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("dialog.theme.light")}</SelectItem>
                <SelectItem value="dark">{t("dialog.theme.dark")}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </DialogContent>
    </Dialog>
  );
};

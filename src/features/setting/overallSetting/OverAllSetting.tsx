import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/i18n/useLanguage";
import type { Language } from "@/i18n/config";

export const OverallSetting = () => {
  const { t } = useTranslation("settings");
  const { language, setLanguage, languages, labels } = useLanguage();

  return (
    <div className="mt-10 mb-12">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Languages className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-normal">{t("language.title")}</p>
              <p className="mt-1 text-xs text-mini">{t("language.subtitle")}</p>
            </div>
          </div>

          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            <SelectTrigger className="w-full !h-10 sm:w-[180px]">
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
        </CardContent>
      </Card>
    </div>
  );
};

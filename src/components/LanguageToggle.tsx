import { Languages, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/useLanguage";

export const LanguageToggle = () => {
  const { t } = useTranslation();
  const { language, setLanguage, languages, labels } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="nav" size="icon" aria-label={t("language.change")}>
          <Languages className="!w-5 !h-5" />
          <span className="sr-only">{t("language.change")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuLabel className="text-xs text-mini">
          {t("language.label")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {languages.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className="cursor-pointer justify-between"
          >
            <span>{labels[code].native}</span>
            {language === code && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

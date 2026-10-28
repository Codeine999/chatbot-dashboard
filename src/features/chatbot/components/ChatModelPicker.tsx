import { useTranslation } from "react-i18next";
import { ChevronDown, Coins, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { modelValue, parseModelValue } from "../lib/chatFormat";
import type { useChatModel } from "../hooks/useChatModel";

type Props = {
  model: ReturnType<typeof useChatModel>;
  isThinking: boolean;
};

/** แถวใต้กล่องพิมพ์ เครดิตที่ใช้ไปทางซ้าย โมเดลที่ตอบทางขวา */
export const ChatModelBar = ({ model, isThinking }: Props) => {
  const { t } = useTranslation("chat");
  const { usage, selected, options, canChange, isCatalogLoading, isUpdating, change } = model;
  const label = selected?.model ?? t("header.loadingModel");

  return (
    <div className="mt-2 flex items-center justify-between gap-3 px-2 text-sm text-mini">
      <p className="flex min-w-0 items-center gap-1.5">
        {usage && (
          <>
            <Coins className="size-4 shrink-0 text-amber-500" />
            <span className="truncate">
              {usage.limitCredit
                ? t("header.creditsWithLimit", { used: usage.usedCredit, limit: usage.limitCredit })
                : t("header.credits", { used: usage.usedCredit })}
            </span>
          </>
        )}
      </p>

      {canChange ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              disabled={isCatalogLoading || options.length === 0 || isUpdating}
              className="h-8 max-w-[60vw] gap-1.5 rounded-lg px-2 text-sm font-normal text-mini hover:text-normal"
            >
              {isUpdating && <LoaderCircle className="size-3.5 animate-spin" />}
              <span className="truncate">{label}</span>
              <ChevronDown className="size-3.5 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-xl p-1.5">
            <DropdownMenuLabel className="text-xs font-normal text-mini">
              {t("header.changeModelNote")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={selected ? modelValue(selected) : ""}
              onValueChange={(value) => {
                const next = parseModelValue(value);
                if (!next) return;
                if (next.provider === selected?.provider && next.model === selected?.model) return;
                change(next);
              }}
            >
              {options.map((option) => (
                <DropdownMenuRadioItem
                  key={`${option.provider}:${option.model}`}
                  value={modelValue(option)}
                  disabled={!option.available || isThinking || isUpdating}
                  className="items-start rounded-lg py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-normal">{option.model}</p>
                    <p className="mt-0.5 text-[11px] text-mini">
                      {option.providerLabel}
                      {!option.available ? t("header.apiKeyUnavailable") : ""}
                    </p>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="truncate px-2" title={t("header.modelLockedNote")}>
          {label}
        </span>
      )}
    </div>
  );
};

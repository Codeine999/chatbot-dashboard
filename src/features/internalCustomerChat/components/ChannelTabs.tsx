import { useTranslation } from "react-i18next";
import type { ChatChannelType } from "../type";

type Props = {
  value: ChatChannelType;
  onChange: (value: ChatChannelType) => void;
};

/** สลับช่องทางแชททดสอบ วางไว้บนสุดของแถบด้านซ้ายของแต่ละช่อง (underline tabs) */
export function ChannelTabs({ value, onChange }: Props) {
  const { t } = useTranslation("chat");
  const tabs: { value: ChatChannelType; label: string }[] = [
    { value: "line", label: t("customerTest.channel.line") },
    { value: "line-application", label: t("customerTest.channel.application") },
  ];

  return (
    <div role="tablist" className="flex gap-5 border-b">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`-mb-px h-11 cursor-pointer whitespace-nowrap border-b-2 text-sm transition-colors ${
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

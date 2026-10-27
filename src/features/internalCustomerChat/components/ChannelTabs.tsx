import { useTranslation } from "react-i18next";
import { PillTabs } from "@/components/common/PillTabs";
import type { ChatChannelType } from "../type";

type Props = {
  value: ChatChannelType;
  onChange: (value: ChatChannelType) => void;
};

/** สลับช่องทางแชททดสอบ วางไว้บนสุดของแถบด้านซ้ายของแต่ละช่อง */
export function ChannelTabs({ value, onChange }: Props) {
  const { t } = useTranslation("chat");

  return (
    <PillTabs<ChatChannelType>
      className="mb-4 flex-nowrap gap-1"
      tabs={[
        { value: "line", label: t("customerTest.channel.line") },
        { value: "line-application", label: t("customerTest.channel.application") },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}

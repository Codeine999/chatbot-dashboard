import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApplicationChat } from "./components/ApplicationChat";
import { ChannelTabs } from "./components/ChannelTabs";
import { LinePreviewChat } from "./components/LinePreviewChat";
import type { ChatChannelType } from "./type";

const CHANNEL_PARAM = "channel";

/**
 * หน้าแชททดสอบ: เลือกช่องทางผ่าน ?channel=
 * - line (ค่าเริ่มต้น): userview เดิม
 * - line-application: App Message API (ห้อง/ประวัติ/ตอบแอดมินจริง)
 * ทั้งสองช่องถูก mount ไว้ตลอดเพื่อไม่ให้ข้อความที่ค้างอยู่หายตอนสลับแท็บ
 */
export default function InternalCustomerChat() {
  const { t } = useTranslation("chat");
  const [params, setParams] = useSearchParams();
  const channel: ChatChannelType =
    params.get(CHANNEL_PARAM) === "line-application" ? "line-application" : "line";

  const select = (value: ChatChannelType) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === "line") next.delete(CHANNEL_PARAM);
        else next.set(CHANNEL_PARAM, value);
        return next;
      },
      { replace: true }
    );
  const tabs = <ChannelTabs value={channel} onChange={select} />;

  return (
    <div className="py-6">
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Customer chat · Internal test
        </p>
        <h1 className="text-2xl font-semibold">{t("customerTest.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("customerTest.subtitle")}</p>
      </div>

      <LinePreviewChat active={channel === "line"} tabs={tabs} />
      <ApplicationChat active={channel === "line-application"} tabs={tabs} />
    </div>
  );
}

import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApplicationChat } from "./components/ApplicationChat";
import { ChannelTabs } from "./components/ChannelTabs";
import { LinePreviewChat } from "./components/LinePreviewChat";
import type { ChatChannelType } from "./type";

const CHANNEL_PARAM = "channel";

/**
 * หน้าแชททดสอบ: เลือกช่องทางผ่าน ?channel=
 * - line-application (ค่าเริ่มต้น): App Message API (ห้อง/ประวัติ/ตอบแอดมินจริง)
 * - line: userview เดิม
 * ทั้งสองช่องถูก mount ไว้ตลอดเพื่อไม่ให้ข้อความที่ค้างอยู่หายตอนสลับแท็บ
 */
export default function InternalCustomerChat() {
  const { t } = useTranslation("chat");
  const [params, setParams] = useSearchParams();
  const channel: ChatChannelType =
    params.get(CHANNEL_PARAM) === "line" ? "line" : "line-application";

  const select = (value: ChatChannelType) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === "line-application") next.delete(CHANNEL_PARAM);
        else next.set(CHANNEL_PARAM, value);
        return next;
      },
      { replace: true }
    );
  const tabs = <ChannelTabs value={channel} onChange={select} />;

  return (
    <div className="pb-8 pt-2">
      <div className="border-b pb-5">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-normal">
            Internal test
          </span>
          <span className="text-[13px] text-muted-foreground">Customer chat</span>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-foreground">
          {t("customerTest.title")}
        </h1>
        <p className="mt-1.5 text-sm text-normal">{t("customerTest.subtitle")}</p>
      </div>

      <LinePreviewChat active={channel === "line"} tabs={tabs} />
      <ApplicationChat active={channel === "line-application"} tabs={tabs} />
    </div>
  );
}

import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { UnderlineTabs } from "@/components/common/UnderlineTabs";
import { LineConnection } from "./LineConnection";
import { FacebookConnection } from "./facebook/FacebookConnection";

const CHANNELS = ["line", "facebook"] as const;
type ConnectionChannel = (typeof CHANNELS)[number];

const isChannel = (value: string | null): value is ConnectionChannel =>
  CHANNELS.some((channel) => channel === value);

/** หน้าเชื่อมต่อช่องทาง ช่องที่เปิดอยู่เก็บใน ?channel= เพื่อแชร์ลิงก์ตรงเข้าแท็บนั้นได้ */
export const Connection = () => {
  const { t } = useTranslation(["settings", "nav"]);
  const [params, setParams] = useSearchParams();
  const requested = params.get("channel");
  const channel: ConnectionChannel = isChannel(requested) ? requested : "line";

  const select = (next: ConnectionChannel) =>
    setParams(next === "line" ? {} : { channel: next }, { replace: true });

  return (
    <PageContainer className="pb-16">
      <PageHeader
        title={t("nav:item.settingConnection")}
        subtitle={t("settings:connection.pageSubtitle")}
      />

      <UnderlineTabs
        className="mt-6"
        value={channel}
        onChange={select}
        tabs={[
          { value: "line", label: t("settings:connection.channels.line") },
          { value: "facebook", label: t("settings:connection.channels.facebook") },
        ]}
      />

      {channel === "line" ? <LineConnection /> : <FacebookConnection />}
    </PageContainer>
  );
};

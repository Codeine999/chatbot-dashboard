import type { TFunction } from "i18next";
import { formatDate, formatTime } from "@/i18n/format";
import type { WebhookHealth, WebhookTestResult } from "../type";

export type RowTone = "success" | "warning" | "danger" | "neutral" | "loading";

export type WebhookRow = {
  id: "configured" | "reachable" | "live";
  tone: RowTone;
  title: string;
  detail: string;
};

const stamp = (iso: string) => `${formatDate(iso)} ${formatTime(iso)}`;
const PREFIX = "connection.webhook.health";

type Input = {
  t: TFunction<"settings">;
  health: WebhookHealth | undefined;
  /** ผลทดสอบรอบนี้ (ในหน้านี้) undefined = ยังไม่ได้กดทดสอบ */
  test: WebhookTestResult | undefined;
  testing: boolean;
  /** backend จำไว้ว่าทดสอบผ่านล่าสุดเมื่อไร ใช้ตอนเพิ่งเปิดหน้า */
  testedOkAt: string | null;
  loading: boolean;
};

/** แปลงผลตรวจทั้งสามชั้นเป็นแถวที่ UI แสดง แยกออกมาเพื่อให้ component มีแต่หน้าตา */
export const buildWebhookRows = ({
  t,
  health,
  test,
  testing,
  testedOkAt,
  loading,
}: Input): WebhookRow[] => {
  const configured: WebhookRow = (() => {
    const title = t(`${PREFIX}.configured.title`);
    if (loading && !health)
      return { id: "configured", tone: "loading", title, detail: t(`${PREFIX}.checking`) };

    const state = health?.configured.state ?? "unknown";
    if (state === "ok")
      return {
        id: "configured",
        tone: "success",
        title,
        detail: t(
          health?.configured.urlMatched === null
            ? `${PREFIX}.configured.okUnchecked`
            : `${PREFIX}.configured.ok`
        ),
      };

    return {
      id: "configured",
      tone: state === "unknown" ? "neutral" : "danger",
      title,
      detail: t(`${PREFIX}.configured.${state}`),
    };
  })();

  const reachable: WebhookRow = (() => {
    const title = t(`${PREFIX}.reachable.title`);
    if (testing)
      return { id: "reachable", tone: "loading", title, detail: t(`${PREFIX}.testing`) };

    if (test?.success)
      return {
        id: "reachable",
        tone: "success",
        title,
        detail: t(`${PREFIX}.reachable.ok`, { status: test.statusCode ?? 200 }),
      };

    if (test)
      return {
        id: "reachable",
        tone: "danger",
        title,
        detail: t(`${PREFIX}.reachable.reasons.${test.reason}`, {
          status: test.statusCode ?? "—",
          defaultValue: t(`${PREFIX}.reachable.reasons.UNKNOWN`),
        }),
      };

    if (testedOkAt)
      return {
        id: "reachable",
        tone: "success",
        title,
        detail: t(`${PREFIX}.reachable.passedBefore`, { when: stamp(testedOkAt) }),
      };

    return { id: "reachable", tone: "neutral", title, detail: t(`${PREFIX}.reachable.idle`) };
  })();

  const live: WebhookRow = (() => {
    const title = t(`${PREFIX}.live.title`);
    if (loading && !health)
      return { id: "live", tone: "loading", title, detail: t(`${PREFIX}.checking`) };

    const lastEventAt = health?.live.lastEventAt;
    if (!lastEventAt)
      return { id: "live", tone: "neutral", title, detail: t(`${PREFIX}.live.none`) };

    const count = health?.live.eventsLast24h ?? 0;
    return {
      id: "live",
      tone: count > 0 ? "success" : "neutral",
      title,
      detail: t(`${PREFIX}.live.last`, { when: stamp(lastEventAt), count }),
    };
  })();

  return [configured, reachable, live];
};

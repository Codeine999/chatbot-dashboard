import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { userviewApi } from "../services/userview.service";
import { previewKeys } from "../hooks/useCustomerPreviewChat";

const formatTime = (epoch: number) =>
  new Date(epoch).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

/** สิ่งที่บอทจำอยู่ตอนนี้ (flow ที่กำลังทำ + context ล่าสุด) ช่วยแอดมินดีบักคำตอบ */
export const PreviewDebugPanel = ({ sessionId }: { sessionId?: string }) => {
  const { t } = useTranslation("chat");
  const { data } = useQuery({
    queryKey: previewKeys.session(sessionId),
    queryFn: () => userviewApi.getSession(sessionId!),
    enabled: Boolean(sessionId),
    retry: false,
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold">{t("customerTest.debug.title")}</h2>
        <p className="mt-1 text-xs text-mini">{t("customerTest.debug.hint")}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-mini">{t("customerTest.debug.workflow")}</p>
        {data?.workflow ? (
          <dl className="mt-2 space-y-1 rounded-xl bg-hover p-3 text-xs">
            {(["flow", "step", "status"] as const).map((key) => (
              <div key={key} className="flex justify-between gap-3">
                <dt className="text-mini">{key}</dt>
                <dd className="break-all font-mono text-normal">{data.workflow?.[key]}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-xs text-mini">{t("customerTest.debug.noWorkflow")}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-mini">
          {t("customerTest.debug.context", { count: data?.context.length ?? 0 })}
        </p>
        {data?.context.length ? (
          <ul className="mt-2 space-y-2">
            {data.context.map((item, index) => (
              <li key={`${item.createdAt}-${index}`} className="rounded-xl bg-hover p-3 text-xs">
                <div className="flex justify-between gap-2 text-mini">
                  <span>{item.role === "user" ? t("customerTest.you") : item.source}</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-normal">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-mini">{t("customerTest.debug.noContext")}</p>
        )}
      </div>
    </div>
  );
};

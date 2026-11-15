import { useTranslation } from "react-i18next";

/** พื้นหลังไล่เฉดแบบ mesh ตามดีไซน์ เป็นสีตกแต่งล้วน ไม่ผูกกับ theme */
const MESH_BACKGROUND = [
  "radial-gradient(circle at 18% 22%, #c7d2fe 0%, rgba(199,210,254,0) 46%)",
  "radial-gradient(circle at 85% 18%, #fbcfe8 0%, rgba(251,207,232,0) 42%)",
  "radial-gradient(circle at 75% 85%, #bae6fd 0%, rgba(186,230,253,0) 48%)",
  "radial-gradient(circle at 20% 90%, #ddd6fe 0%, rgba(221,214,254,0) 40%)",
  "#f5f2ef",
].join(", ");

const GeminiSparkle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z"
      fill="#4f46e5"
    />
  </svg>
);

/**
 * แผงแบรนด์ฝั่งขวาของหน้า login ซ่อนบนจอเล็กเพื่อให้ฟอร์มเป็นจุดโฟกัสเดียว
 * บทสนทนาตัวอย่างเป็นภาพประกอบ ซ่อนจาก screen reader
 */
export const LoginBrandPanel = () => {
  const { t } = useTranslation("auth");

  return (
    <aside
      aria-label="keeLa"
      style={{ background: MESH_BACKGROUND }}
      className="relative m-3 flex min-h-[560px] min-w-0 flex-[3_1_0%] flex-col justify-between overflow-hidden rounded-3xl p-10 max-lg:hidden"
    >
      <span className="inline-flex h-7 items-center gap-1.5 self-end rounded-full bg-white/70 px-3 text-xs font-medium text-normal shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)]">
        <span className="size-1.5 rounded-full bg-[#06c755]" />
        {t("login.panel.connected")}
      </span>

      <div
        aria-hidden
        className="flex w-full max-w-[380px] flex-col gap-2.5 self-center rounded-[20px] bg-white/70 p-[18px] shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(78,50,23,0.06)_0px_12px_32px]"
      >
        <div className="flex items-center gap-2.5 border-b border-black/5 pb-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#fef3c7] text-xs font-semibold text-[#a16207]">
            N
          </span>
          <span className="text-[13px] font-semibold text-foreground">{t("login.panel.customer")}</span>
          <span className="ml-auto text-[11px] text-mini">LINE</span>
        </div>
        <div className="max-w-[80%] self-start rounded-2xl rounded-bl-[6px] bg-[#f5f5f5] px-[13px] py-[9px] text-[13px] leading-[1.5] text-black">
          {t("login.panel.question")}
        </div>
        <div className="max-w-[80%] self-end rounded-2xl rounded-br-[6px] bg-black px-[13px] py-[9px] text-[13px] leading-[1.5] text-white">
          {t("login.panel.answer")}
        </div>
        <span className="flex items-center gap-[5px] self-end text-[11px] text-mini">
          <GeminiSparkle size={10} />
          {t("login.panel.repliedBy")}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[64px] leading-none font-semibold tracking-[-0.05em] text-black">keeLa</span>
        <span className="max-w-[400px] text-[17px] leading-[1.5] text-[#4e4e4e]">{t("login.panel.tagline")}</span>
      </div>
    </aside>
  );
};

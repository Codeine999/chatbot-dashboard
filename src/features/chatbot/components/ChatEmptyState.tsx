import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

/**
 * หน้าเริ่มแชท คำทักทายวางเหนือกล่องพิมพ์ (ส่งเข้ามาเป็น children)
 * ทั้งก้อนอยู่ต่ำกว่ากึ่งกลางจอเล็กน้อย ตามตำแหน่งในดีไซน์
 */
export const ChatEmptyState = ({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("chat");

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col justify-center px-4 pb-10 pt-[18vh] sm:px-6">
      <h1 className="mb-6 flex items-center justify-center gap-3 text-3xl font-normal tracking-tight text-normal sm:text-[2.5rem] sm:leading-tight">
        <Sparkles className="size-8 shrink-0 text-primary sm:size-9" aria-hidden />
        <span className="truncate">
          {t("greetingPrefix")} {displayName}
        </span>
      </h1>

      {children}
    </div>
  );
};

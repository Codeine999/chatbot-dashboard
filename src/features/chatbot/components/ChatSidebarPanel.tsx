import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useChatSidebarStore } from "../store/chatSidebar.store";
import { useReturnPathStore } from "../lib/chatRoute";
import ChatHistorySidebar from "./ChatHistorySidebar";
import { SidebarNavRow } from "./SidebarRows";

/** เนื้อ sidebar หลักเมื่ออยู่หน้า AI Chat: ปุ่มออก + ชื่อแบรนด์ + ประวัติแชท */
export const ChatSidebarPanel = ({ onExit }: { onExit?: () => void }) => {
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const returnPath = useReturnPathStore((state) => state.path);
  const sidebarProps = useChatSidebarStore((state) => state.props);

  const exit = () => {
    onExit?.();
    navigate(returnPath);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-2 pt-3">
        <SidebarNavRow icon={ArrowLeft} label={t("sidebar.exit")} onClick={exit} />
        <p className="px-3 pb-1 pt-3 text-base font-semibold tracking-tight text-normal">
          {t("header.brand")}
        </p>
      </div>

      {/* หน้าแชทยังไม่ส่ง props มา (เพิ่งเข้า) แสดงเป็นสถานะกำลังโหลดไปก่อน */}
      <ChatHistorySidebar
        rooms={[]}
        onSelect={() => {}}
        onNewChat={() => {}}
        onDelete={() => {}}
        isLoading={!sidebarProps}
        {...sidebarProps}
      />
    </div>
  );
};

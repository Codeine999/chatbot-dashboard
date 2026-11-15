import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/Sidebar"
import { AdminToolChat } from "@/components/AdminToolChat";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { isAiChatRoute, useReturnPathStore } from "@/features/chatbot/lib/chatRoute";
import { Background } from "@/components/BackGround";

const MainLayout = () => {
  const location = useLocation();

  // จำหน้าล่าสุดที่ไม่ใช่ AI Chat ไว้ให้ปุ่ม "ออก" ใน sidebar กลับไปได้
  const setReturnPath = useReturnPathStore((state) => state.setPath);
  useEffect(() => {
    if (!isAiChatRoute(location.pathname)) {
      setReturnPath(`${location.pathname}${location.search}`);
    }
  }, [location.pathname, location.search, setReturnPath]);

  return (
    <div>
      <SidebarProvider>
        <Sidebar />
        <main className="relative isolate min-h-svh w-full min-w-0">
          <Background />
          <div className="relative">
            <Navbar />
            <div className="xl:px-6 md:px-6 px-4">
              <Outlet />
            </div>
            <AdminToolChat />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default MainLayout

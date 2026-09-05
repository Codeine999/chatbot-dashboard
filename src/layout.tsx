import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar"
import { AdminToolChat } from "@/components/AdminToolChat";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { isSidebarLockedRoute } from "@/lib/sidebarLock";
import { Background } from "@/components/BackGround";

const MainLayout = () => {
  const location = useLocation();

  // หน้าที่ล็อก sidebar ต้องเริ่มด้วยสถานะปิดตั้งแต่ render แรก
  // ถ้าไปสั่งปิดทีหลังใน useEffect จะเห็น sidebar กางออกมาแวบนึงตอน refresh
  const sidebarLocked = isSidebarLockedRoute(location.pathname);

  return (
    <div>
      <SidebarProvider defaultOpen={!sidebarLocked}>
        <Sidebar />
        <main className="relative isolate min-h-svh w-full">
          <Background />
          <div className="relative">
            <Navbar />
            <div className="xl:px-10 md:px-6 px-4">
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

import { useEffect, useRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * ล็อก sidebar หลักให้อยู่ที่แถบไอคอนตลอดเวลาที่อยู่ในหน้านี้ แล้วคืนค่าเดิมตอนออกจากหน้า
 *
 * ตอน refresh หน้านี้ Layout จะส่ง defaultOpen={false} ให้ SidebarProvider อยู่แล้ว
 * hook นี้จึงมีไว้คุมกรณีที่ provider mount ค้างอยู่แล้ว เช่น กดลิงก์เข้ามาจากหน้าอื่น
 * และกันไม่ให้ขยายระหว่างอยู่ในหน้านี้ (คีย์ลัด Ctrl/Cmd+B, SidebarRail)
 */
export function useLockedSidebar() {
  const { open, setOpen } = useSidebar();

  // เก็บค่าตอน mount ไว้คืนตอนออกจากหน้า
  const previousOpenRef = useRef(open);
  // setOpen เปลี่ยน identity ทุกครั้งที่ open เปลี่ยน เลยเก็บใน ref กัน effect รันซ้ำ
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    const previousOpen = previousOpenRef.current;

    return () => setOpenRef.current(previousOpen);
  }, []);

  useEffect(() => {
    if (open) setOpenRef.current(false);
  }, [open]);
}

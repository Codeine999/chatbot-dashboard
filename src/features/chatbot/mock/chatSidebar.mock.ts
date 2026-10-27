import { Clock, Ellipsis, FolderOpen, type LucideIcon } from "lucide-react";

// ยังไม่มีหน้า/ฟีเจอร์จริง แสดงเมนูไว้ก่อน กดแล้วขึ้น "เร็ว ๆ นี้"
export const sidebarNavMock: { key: string; icon: LucideIcon }[] = [
  { key: "projects", icon: FolderOpen },
  { key: "scheduled", icon: Clock },
  { key: "more", icon: Ellipsis },
];

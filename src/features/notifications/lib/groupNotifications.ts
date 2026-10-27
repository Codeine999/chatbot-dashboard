import type { AdminNotification } from "../types/notification.type";

export type NotificationGroups = {
  today: AdminNotification[];
  earlier: AdminNotification[];
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** แยกเป็น "วันนี้" กับ "ก่อนหน้านี้" ตามวันที่ในเครื่องผู้ใช้ คงลำดับเดิมจาก API */
export const groupNotificationsByDay = (
  notifications: AdminNotification[],
  now = new Date()
): NotificationGroups => {
  const groups: NotificationGroups = { today: [], earlier: [] };

  for (const notification of notifications) {
    const key = isSameDay(new Date(notification.createdAt), now) ? "today" : "earlier";
    groups[key].push(notification);
  }

  return groups;
};

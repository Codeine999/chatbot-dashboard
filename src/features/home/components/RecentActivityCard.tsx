import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleCheck,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import type { ActivityTone, RecentActivityItem } from "../type";
import { useTranslation } from "react-i18next";

const toneClass: Record<ActivityTone, string> = {
  green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
};

const iconByType = {
  webhook: CircleCheck,
  richMenu: LayoutGrid,
  broadcast: Megaphone,
  profile: RefreshCw,
  welcome: MessageSquare,
};

// mock ไว้ก่อน รอต่อ API activity log จริง
const activityMock: RecentActivityItem[] = [
  {
    id: "1",
    type: "webhook",
    tone: "green",
    title: "Webhook verified",
    description: "Connection verified successfully",
    time: "14:30",
  },
  {
    id: "2",
    type: "richMenu",
    tone: "indigo",
    title: "Rich menu updated",
    description: "Main Menu was updated",
    time: "May 28, 11:20",
  },
  {
    id: "3",
    type: "broadcast",
    tone: "purple",
    title: "Broadcast scheduled",
    description: "Promo June - scheduled for Jun 1, 10:00",
    time: "May 28, 09:45",
  },
  {
    id: "4",
    type: "profile",
    tone: "blue",
    title: "Profile synced",
    description: "Profile information synced",
    time: "May 27, 16:20",
  },
  {
    id: "5",
    type: "welcome",
    tone: "orange",
    title: "Welcome message updated",
    description: "Welcome message content updated",
    time: "May 27, 10:10",
  },
];

const RecentActivityCard = () => {
  const { t } = useTranslation("home");
  const activities = activityMock;

  return (
    <Card className="flex h-[384px] flex-col p-6">
      <div className="flex items-center justify-between">
        <CardTitle>{t("activity.title")}</CardTitle>
        <Button variant="ghost" className="text-sm font-medium text-icons">
          {t("activity.viewAll")}
        </Button>
      </div>

      <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
        {activities.map((activity) => {
          const Icon = iconByType[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition hover:bg-hover"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  toneClass[activity.tone]
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-normal">
                  {activity.title}
                </p>
                <p className="truncate text-xs text-mini">{activity.description}</p>
              </div>

              <span className="shrink-0 text-xs text-mini">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivityCard;

import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"

import Chatbot from "./home/Chat";

import OverviewCard from "./home/components/OverviewCard";
import MoneyCard from "./home/components/MoneyCard";
import AccountOverviewCard from "./home/components/AccountOverviewCard";
import RecentActivityCard from "./home/components/RecentActivityCard";

// เก็บไว้ก่อน ยังไม่ลบ เผื่อกลับมาใช้
// import Order from "./home/components/OrderCard";
// import ViewCard from "./home/components/ViewCard";

const home = () => {

  return (
    <main className="min-h-svh py-2 text-slate-900">
      <div className="mb-12">
        <div className="mt-2 text-color">
          <CardTitle className="text-2xl">
            Welcome, Codeine
          </CardTitle>
          <CardDescription className="text-sm">
            Overview dashboard
          </CardDescription>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <OverviewCard />
          </div>

          {/* Account overview and Chart — 40 / 60 */}
          <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
            <AccountOverviewCard />
            <MoneyCard />
            {/* <Order /> */}
          </div>

          {/* Chatbot and Recent activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Chatbot />
            <RecentActivityCard />
            {/* <ViewCard /> */}
          </div>
        </div>
      </div>
    </main>
  );
};

export default home;

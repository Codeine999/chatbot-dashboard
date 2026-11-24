import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

// import Chatbot from "./home/Chat";

import OverviewCard from "./home/components/OverviewCard";
import AccountOverviewCard from "./home/components/AccountOverviewCard";
import RecentActivityCard from "./home/components/RecentActivityCard";
import UnansweredQuestionsCard from "./home/components/UnansweredQuestionsCard";
import { MetricCard } from "./usage/components/MetricCard";
import { useTranslation } from "react-i18next";
import { useAuthUser } from "@/features/auth/store/auth.store";

// เก็บไว้ก่อน ยังไม่ลบ เผื่อกลับมาใช้
// import MoneyCard from "./home/components/MoneyCard";
// import Order from "./home/components/OrderCard";
// import ViewCard from "./home/components/ViewCard";

const Home = () => {
  const { t } = useTranslation("home");
  const user = useAuthUser();

  return (
    <main className="min-h-svh">
      <PageContainer>
        <PageHeader
          eyebrow={t("subtitle")}
          title={t("welcome", {
            name: user?.firstname || user?.username || "",
          })}
        />

        <div className="mt-10 flex flex-col gap-[52px]">
          {/* Overview */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-y-7">
            <OverviewCard />
          </div>

          {/* Account overview (ซ้าย) | Chart (ขวา) คั่นด้วยเส้นตั้ง */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-0">
            <div className="min-w-0 lg:pr-8">
              <AccountOverviewCard />
            </div>
            {/* การ์ดใบเดียวกับที่ใช้ในหน้า usage สลับช่วงเวลาได้ในตัวเอง */}
            <div className="min-w-0 lg:border-l lg:pl-8">
              <MetricCard metric="chat" variant="flat" />
            </div>
            {/* <MoneyCard /> */}
            {/* <Order /> */}
          </div>

          {/* Chatbot and Recent activity */}
          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* <Chatbot /> */}
            <div className="-mt-2">
              <UnansweredQuestionsCard />
            </div>
            <RecentActivityCard />
            {/* <ViewCard /> */}
          </div>
        </div>
      </PageContainer>
    </main>
  );
};

export default Home;

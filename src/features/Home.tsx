import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { FadeIn } from "@/components/motion";

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
        <FadeIn as="header" y={12} duration={0.55}>
          <PageHeader
            eyebrow={t("subtitle")}
            title={t("welcome", {
              name: user?.firstname || user?.username || "",
            })}
          />
        </FadeIn>

        <div className="mt-10 flex flex-col gap-[52px]">
          {/* Overview */}
          <OverviewCard />

          {/* Account overview (ซ้าย) | Chart (ขวา) คั่นด้วยเส้นตั้ง */}
          <FadeIn
            as="section"
            delay={0.2}
            y={16}
            duration={0.6}
            className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-0"
          >
            <div className="min-w-0 lg:pr-8">
              <AccountOverviewCard />
            </div>
            {/* การ์ดใบเดียวกับที่ใช้ในหน้า usage สลับช่วงเวลาได้ในตัวเอง */}
            <div className="min-w-0 lg:border-l lg:pl-8">
              <MetricCard metric="chat" variant="flat" />
            </div>
            {/* <MoneyCard /> */}
            {/* <Order /> */}
          </FadeIn>

          {/* Chatbot and Recent activity */}
          <FadeIn
            as="section"
            inView
            delay={0.08}
            y={16}
            duration={0.6}
            className="grid items-start gap-12 lg:grid-cols-2"
          >
            {/* <Chatbot /> */}
            <div className="-mt-2">
              <UnansweredQuestionsCard />
            </div>
            <RecentActivityCard />
            {/* <ViewCard /> */}
          </FadeIn>
        </div>
      </PageContainer>
    </main>
  );
};

export default Home;

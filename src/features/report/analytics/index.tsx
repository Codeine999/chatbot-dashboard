import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/features/usage/components/MetricCard";
import { MOTION_SPRING } from "@/lib/motion";
import { ChatChannelBreakdownCard } from "./components/ChatChannelBreakdownCard";
import { ChatKpiStrip } from "./components/ChatKpiStrip";
import { RecentChatTurnsCard } from "./components/RecentChatTurnsCard";
import { useChatAnalytics } from "./hooks/useChatAnalytics";

export const ChatAnalyticsPage = () => {
  const { t } = useTranslation("report");
  const prefersReduced = useReducedMotion();
  const queryClient = useQueryClient();
  const { data: summary, isLoading, isFetching, refetch } = useChatAnalytics();

  const handleRefresh = () => {
    void refetch();
    void queryClient.invalidateQueries({ queryKey: ["analytics", "chat"] });
  };

  return (
    <main className="min-h-svh">
      <PageContainer>
        <FadeIn as="header" y={12} duration={0.55}>
          <PageHeader
            eyebrow={t("analytics.chat.eyebrow")}
            title={t("analytics.chat.title")}
            subtitle={t("analytics.chat.subtitle")}
            actions={
              <motion.div
                whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                transition={MOTION_SPRING.snappy}
              >
                <Button
                  variant="pill"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="h-9 gap-1.5 rounded-full px-3.5 text-[13px] font-medium"
                >
                  <RefreshCw
                    className={`!h-4 !w-4 text-mini ${isFetching ? "animate-spin" : ""}`}
                  />
                  {t("analytics.chat.refresh")}
                </Button>
              </motion.div>
            }
          />
        </FadeIn>

        <div className="mt-10 flex flex-col gap-[52px]">
          {/* KPI สรุปภาพรวมแชท */}
          <ChatKpiStrip summary={summary} isLoading={isLoading} />

          {/* กราฟปริมาณแชท (ซ้าย) | สัดส่วนช่องทางและหมวดหมู่คำตอบ (ขวา) */}
          <FadeIn
            as="section"
            delay={0.2}
            y={16}
            duration={0.6}
            className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-0"
          >
            <div className="min-w-0 lg:pr-8">
              <MetricCard metric="chat" variant="flat" />
            </div>

            <div className="min-w-0 lg:border-l lg:pl-8">
              <ChatChannelBreakdownCard
                channels={summary?.channels ?? []}
                topics={summary?.topics ?? []}
                isLoading={isLoading}
              />
            </div>
          </FadeIn>

          {/* รายการตอบกลับล่าสุด กรองตามช่องทางได้ */}
          <FadeIn as="section" inView delay={0.08} y={16} duration={0.6}>
            <RecentChatTurnsCard
              turns={summary?.recentTurns ?? []}
              isSample={summary?.isSample ?? false}
            />
          </FadeIn>
        </div>
      </PageContainer>
    </main>
  );
};

export default ChatAnalyticsPage;

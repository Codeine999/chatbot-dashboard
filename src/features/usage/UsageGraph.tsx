import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "./components/MetricCard";
import { METRIC_ORDER } from "./lib/metrics";

export const UsageGraph = () => {
  const { t } = useTranslation("usage");

  return (
    <PageContainer>
      <PageHeader title={t("graph.title")} subtitle={t("graph.subtitle")} />

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {METRIC_ORDER.map((metric) => (
          <MetricCard key={metric} metric={metric} />
        ))}
      </div>
    </PageContainer>
  );
};

export default UsageGraph;

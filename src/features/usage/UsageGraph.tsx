import { MetricCard } from "./components/MetricCard";
import { METRIC_ORDER } from "./lib/metrics";

export const UsageGraph = () => (
  <div className="mt-10 mb-12">
    <div>
      <h1 className="text-2xl font-semibold text-normal">Analytics</h1>
      <p className="mt-2 text-sm text-mini">
        Token spend, chat volume, followers, and revenue. Pick a range on any chart.
      </p>
    </div>

    <div className="mt-6 grid gap-5 xl:grid-cols-2">
      {METRIC_ORDER.map((metric) => (
        <MetricCard key={metric} metric={metric} />
      ))}
    </div>
  </div>
);

export default UsageGraph;

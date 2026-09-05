import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { buildChartConfig, STACK_GAP, type MetricDef } from "../lib/metrics";
import type { AnalyticsPoint } from "../type/analytics.type";

const AXIS = { tickLine: false, axisLine: false } as const;

/** จำนวน bucket ที่น้อยพอจะติดตัวเลขบนแท่งได้โดยไม่ตีกัน */
const DIRECT_LABEL_MAX = 6;

type Props = {
  metric: MetricDef;
  points: AnalyticsPoint[];
};

export const MetricChart = ({ metric, points }: Props) => {
  const config = buildChartConfig(metric);
  const isStacked = metric.series.length > 1;
  const isLine = metric.form === "line";

  // recharts อ่านชนิดของ children ตรง ๆ ถ้าห่อด้วย fragment มันจะมองไม่เห็นแกนกับ legend
  // ส่ง array แทน เพราะ React.Children.toArray แผ่ array ออกให้
  const axes = [
    <CartesianGrid key="grid" vertical={false} />,
    <XAxis
      key="x"
      dataKey="label"
      {...AXIS}
      tickMargin={10}
      // ช่วงที่ bucket น้อยมีที่พอโชว์ครบทุกป้าย ช่วงที่ถี่ค่อยปล่อยให้ recharts ตัดทิ้ง
      minTickGap={points.length > 12 ? 28 : 4}
      interval="preserveStartEnd"
    />,
    <YAxis
      key="y"
      {...AXIS}
      width={52}
      tickMargin={4}
      tickFormatter={metric.formatAxis}
      domain={isLine ? ["auto", "auto"] : undefined}
    />,
    <ChartTooltip
      key="tooltip"
      content={
        <ChartTooltipContent
          indicator="dot"
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel}
          formatter={(value, name) => (
            <div className="flex flex-1 items-center justify-between gap-4">
              <span className="text-muted-foreground">{config[name]?.label ?? name}</span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {metric.formatValue(Number(value))}
              </span>
            </div>
          )}
        />
      }
    />,
    ...(isStacked ? [<ChartLegend key="legend" content={<ChartLegendContent />} />] : []),
  ];

  if (isLine) {
    const [series] = metric.series;

    return (
      <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
        <LineChart accessibilityLayer data={points} margin={{ left: 0, right: 8, top: 8 }}>
          {axes}

          <Line
            dataKey={series.key}
            type="monotone"
            stroke={`var(--color-${series.key})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-surface)" }}
          />
        </LineChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart accessibilityLayer data={points} margin={{ left: 0, right: 8, top: 16 }}>
        {axes}

        {metric.series.map((series, index) => {
          const isTop = index === metric.series.length - 1;

          return (
            <Bar
              key={series.key}
              dataKey={series.key}
              stackId={isStacked ? "stack" : undefined}
              fill={`var(--color-${series.key})`}
              radius={isTop ? [4, 4, 0, 0] : 0}
              maxBarSize={56}
              isAnimationActive={false}
              {...(isStacked ? STACK_GAP : {})}
            >
              {isTop && points.length <= DIRECT_LABEL_MAX && (
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={8}
                  className="fill-normal text-[11px] font-semibold"
                  formatter={metric.formatAxis}
                />
              )}
            </Bar>
          );
        })}
      </BarChart>
    </ChartContainer>
  );
};

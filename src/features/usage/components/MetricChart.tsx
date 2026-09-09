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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { buildChartConfig, type MetricDef } from "../lib/metrics";
import { useTranslation } from "react-i18next";
import type { AnalyticsPoint } from "../type/analytics.type";

const AXIS = { tickLine: false, axisLine: false } as const;

/**
 * จำนวน bucket ที่น้อยพอจะติดตัวเลขบนแท่งได้โดยไม่ตีกัน
 *
 * ใช้กับกราฟ series เดียวเท่านั้น กราฟที่แยกประเภทจะได้ตัวเลขคูณสามเต็มไปหมด
 * ปล่อยให้ tooltip กับตารางข้อมูลเป็นคนบอกตัวเลขแทน
 */
const DIRECT_LABEL_MAX = 6;

/**
 * ความหนาสูงสุดของแท่ง
 *
 * แท่งอ้วนเต็มช่องอ่านง่ายก็จริง แต่พอเป็นสีทึบทั้งใบจะดูหนักและกินพื้นที่เกินจำเป็น
 * กำหนดเพดานไว้แล้วปล่อยที่เหลือให้เป็นช่องว่าง กราฟจะโปร่งขึ้นโดยไม่เสียความชัด
 */
const MAX_BAR_THICKNESS = 24;

/**
 * กราฟหลาย series วางแท่งเรียงข้างกัน ไม่ซ้อนทับ
 * เทียบขนาดของแต่ละประเภทในวันเดียวกันได้ตรง ๆ โดยไม่ต้องกะจากความสูงของชั้น
 * แลกกับแท่งที่ผอมลงตามจำนวน series
 */
const GROUPED_BAR = {
  barGap: 6,
  barCategoryGap: "18%",
  maxBarSize: MAX_BAR_THICKNESS,
  radius: 3,
} as const;
const SINGLE_BAR = {
  barCategoryGap: "12%",
  maxBarSize: MAX_BAR_THICKNESS,
  radius: 4,
} as const;

/**
 * ความกว้างขั้นต่ำที่ให้กับหนึ่ง bucket
 *
 * การ์ดกว้างครึ่งจอ ถ้าบีบ 30 bucket ให้พอดีกรอบ แท่งจะเหลือไม่กี่พิกเซลจนอ่านไม่ออก
 * กำหนดขั้นต่ำไว้แล้วปล่อยให้เลื่อนแนวนอนแทน ดีกว่าย่อจนดูอะไรไม่รู้เรื่อง
 * กราฟที่ bucket น้อยยังยืดเต็มกรอบเหมือนเดิม เพราะเป็น min ไม่ใช่ค่าตายตัว
 */
const MIN_BUCKET_WIDTH = { grouped: 70, single: 30 } as const;

/** เผื่อที่ให้แกน Y ตอนคำนวณความกว้างขั้นต่ำของกราฟ */
const Y_AXIS_WIDTH = 52;

type Props = {
  metric: MetricDef;
  points: AnalyticsPoint[];
};

/**
 * กรอบเลื่อนแนวนอนของกราฟ
 *
 * ต้องประกาศไว้นอก MetricChart ถ้าประกาศข้างในจะกลายเป็น component ตัวใหม่ทุกรอบ render
 * React จะ unmount กราฟทิ้งแล้วสร้างใหม่ ทำให้กระพริบและเสียประสิทธิภาพ
 *
 * overscroll-x-contain กันไม่ให้ปัดกราฟจนสุดแล้วหน้าเว็บเลื่อนตาม
 */
/**
 * legend วางนอกกรอบเลื่อน
 *
 * ถ้าใช้ <ChartLegend> ของ recharts มันจะอยู่ในเนื้อกราฟ พอกราฟกว้างเกินกรอบ
 * legend จะถูกจัดกึ่งกลางตามความกว้างจริงแล้วหลุดออกไปนอกจอ ต้องเลื่อนไปหา
 *
 * ใช้ series.color ตรง ๆ ไม่ใช่ var(--color-xxx) เพราะตัวหลังถูกประกาศไว้
 * ใน scope ของ ChartContainer เท่านั้น ออกมาข้างนอกแล้วจะไม่มีค่า
 */
const ChartLegendRow = ({ metric }: { metric: MetricDef }) => {
  const { t } = useTranslation("usage");

  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {metric.series.map((series) => (
        <span
          key={series.key}
          className="flex items-center gap-1.5 text-xs text-mini"
        >
          <span
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: series.color }}
          />
          {t(series.labelKey)}
        </span>
      ))}
    </div>
  );
};

const ChartScroller = ({
  minWidth,
  children,
}: {
  minWidth: number;
  children: React.ReactNode;
}) => (
  <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
    <div style={{ minWidth }}>{children}</div>
  </div>
);

export const MetricChart = ({ metric, points }: Props) => {
  const { t } = useTranslation("usage");
  const config = buildChartConfig(metric, t);
  const hasBreakdown = metric.series.length > 1;
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
              <span className="text-muted-foreground">
                {config[name]?.label ?? name}
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {metric.formatValue(Number(value))}
              </span>
            </div>
          )}
        />
      }
    />,
  ];

  // กราฟเส้นอ่านออกแม้จุดถี่ ปล่อยให้ย่อพอดีกรอบไปเลย ไม่ต้องเลื่อน
  const minBucketWidth = isLine
    ? 0
    : hasBreakdown
      ? MIN_BUCKET_WIDTH.grouped
      : MIN_BUCKET_WIDTH.single;

  // แกน Y เลื่อนไปพร้อมเนื้อกราฟ จึงต้องบวกความกว้างของมันเข้าไปด้วย
  const minWidth = minBucketWidth
    ? points.length * minBucketWidth + Y_AXIS_WIDTH
    : 0;

  if (isLine) {
    const [series] = metric.series;

    return (
      <ChartScroller minWidth={minWidth}>
        <ChartContainer
          config={config}
          className="mt-8 aspect-auto h-[210px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={points}
            margin={{ left: 0, right: 8, top: 8 }}
          >
            {axes}

            <Line
              dataKey={series.key}
              type="monotone"
              stroke={`var(--color-${series.key})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "var(--chart-surface)",
              }}
            />
          </LineChart>
        </ChartContainer>
      </ChartScroller>
    );
  }

  return (
    <div>
      <ChartScroller minWidth={minWidth}>
        <ChartContainer
          config={config}
          className="mt-8 aspect-auto h-[210px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={points}
            margin={{ left: 0, right: 8, top: 16 }}
            barGap={hasBreakdown ? GROUPED_BAR.barGap : undefined}
            barCategoryGap={
              hasBreakdown
                ? GROUPED_BAR.barCategoryGap
                : SINGLE_BAR.barCategoryGap
            }
          >
            {axes}

            {metric.series.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                fill={`var(--color-${series.key})`}
                radius={
                  hasBreakdown
                    ? [GROUPED_BAR.radius, GROUPED_BAR.radius, 0, 0]
                    : [SINGLE_BAR.radius, SINGLE_BAR.radius, 0, 0]
                }
                maxBarSize={
                  hasBreakdown ? GROUPED_BAR.maxBarSize : SINGLE_BAR.maxBarSize
                }
                isAnimationActive={false}
              >
                {/* ติดตัวเลขเฉพาะกราฟ series เดียว
                    ถ้าแยกประเภทจะได้ตัวเลขสามชุดต่อหนึ่งช่วง รกจนไม่มีใครอ่าน
                    tooltip กับตารางข้อมูลบอกได้ครบกว่าอยู่แล้ว */}
                {!hasBreakdown && points.length <= DIRECT_LABEL_MAX && (
                  <LabelList
                    dataKey="total"
                    position="top"
                    offset={8}
                    className="fill-normal text-[11px] font-semibold"
                    formatter={metric.formatAxis}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </ChartScroller>

      {hasBreakdown && <ChartLegendRow metric={metric} />}
    </div>
  );
};

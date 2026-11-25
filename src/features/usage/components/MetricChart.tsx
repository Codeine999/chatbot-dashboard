import { useLayoutEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
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
  /** false = ไม่วาด legend ใต้กราฟ (ผู้เรียกวางเอง) */
  showLegend?: boolean;
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
export const ChartLegendRow = ({
  metric,
  className = "mt-1 justify-center",
}: {
  metric: MetricDef;
  className?: string;
}) => {
  const { t } = useTranslation("usage");

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
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

/**
 * เลื่อนกรอบให้ bucket ล่าสุดที่มีข้อมูลชิดขอบขวาของกรอบ
 *
 * ถ้าให้เบราว์เซอร์ค้างตำแหน่งเดิมไว้ พอเปลี่ยนช่วงเวลา (รายวัน/รายเดือน) หรือข้อมูลมาทีหลัง
 * กรอบอาจไปหยุดตรงช่วงว่างจนเห็นกราฟเปล่า ทั้งที่ข้อมูลอยู่นอกกรอบ
 * ถ้าไม่มีข้อมูลเลย (focusIndex < 0) ให้ไปที่ช่วงล่าสุดแทน
 *
 * ผูกกับ focusIndex กับจำนวน bucket ไม่ผูกกับ array points เพราะ refetch ทุกครั้งได้ array ใหม่
 * ถ้าผูกไว้ ผู้ใช้เลื่อนดูย้อนหลังอยู่ก็จะถูกดีดกลับ
 */
const ChartScroller = ({
  minWidth,
  bucketWidth,
  focusIndex,
  bucketCount,
  children,
}: {
  minWidth: number;
  bucketWidth: number;
  focusIndex: number;
  bucketCount: number;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    // เผื่อครึ่ง bucket ท้ายแท่งสุดท้ายจะได้ไม่ถูกขอบกรอบตัด
    const target =
      focusIndex < 0
        ? maxScroll
        : (focusIndex + 1.5) * bucketWidth + Y_AXIS_WIDTH - el.clientWidth;

    el.scrollLeft = Math.min(Math.max(target, 0), Math.max(maxScroll, 0));
  }, [minWidth, bucketWidth, focusIndex, bucketCount]);

  return (
    <div ref={ref} className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
};

type AnimatedBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  index?: number;
  topRadius: number;
  seriesIndex: number;
  barSequence: {
    orderMap: Map<string, number>;
    total: number;
  };
  prefersReduced: boolean;
};

const buildRoundedTopBarPath = (
  x: number,
  bottomY: number,
  width: number,
  barHeight: number,
  topRadius: number
) => {
  const h = Math.max(barHeight, 0);
  const topY = bottomY - h;
  const r = Math.min(topRadius, width / 2, h);

  return [
    `M ${x},${bottomY}`,
    `L ${x},${topY + r}`,
    `Q ${x},${topY} ${x + r},${topY}`,
    `L ${x + width - r},${topY}`,
    `Q ${x + width},${topY} ${x + width},${topY + r}`,
    `L ${x + width},${bottomY}`,
    "Z",
  ].join(" ");
};

/**
 * แท่งกราฟที่ค่อย ๆ ยืดขึ้นจากเส้นฐานทีละแท่งเรียงจากซ้ายไปขวาด้วย Framer Motion
 * ใช้ path morphing ยึดฐานล่างไว้ที่ bottomY เสมอ ทำให้มุมมนคงรูปและยืดจากล่างขึ้นบนจริงในทุกเบราว์เซอร์
 */
const AnimatedBarShape = ({
  x,
  y,
  width,
  height,
  fill,
  index = 0,
  topRadius,
  seriesIndex,
  barSequence,
  prefersReduced,
}: AnimatedBarShapeProps) => {
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const bottomY = y + height;
  const baselinePath = buildRoundedTopBarPath(x, bottomY, width, 0, topRadius);
  const fullPath = buildRoundedTopBarPath(x, bottomY, width, height, topRadius);

  const seq = barSequence.orderMap.get(`${index}:${seriesIndex}`) ?? 0;
  const stepDelay =
    barSequence.total > 1 ? Math.min(0.14, 1.8 / barSequence.total) : 0;
  const delay = 0.15 + seq * stepDelay;

  return (
    <motion.path
      d={fullPath}
      fill={fill}
      initial={prefersReduced ? false : { d: baselinePath, opacity: 0 }}
      animate={{ d: fullPath, opacity: 1 }}
      transition={{
        d: {
          duration: 0.48,
          delay,
          ease: MOTION_EASE.out,
        },
        opacity: {
          duration: 0.12,
          delay,
          ease: "easeOut",
        },
      }}
    />
  );
};

export const MetricChart = ({ metric, points, showLegend = true }: Props) => {
  const { t } = useTranslation("usage");
  const prefersReduced = Boolean(useReducedMotion());
  const config = buildChartConfig(metric, t);
  const hasBreakdown = metric.series.length > 1;
  const isLine = metric.form === "line";

  // จัดลำดับแท่งที่มีค่า > 0 เรียงจากซ้ายไปขวาทีละแท่ง (ตามวัน -> ตาม series)
  const barSequence = useMemo(() => {
    const orderMap = new Map<string, number>();
    let seq = 0;
    points.forEach((point, pointIndex) => {
      metric.series.forEach((series, seriesIndex) => {
        if (Number(point[series.key]) > 0) {
          orderMap.set(`${pointIndex}:${seriesIndex}`, seq);
          seq += 1;
        }
      });
    });
    return { orderMap, total: seq };
  }, [points, metric.series]);

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
      domain={isLine ? ["auto", "auto"] : [0, (max: number) => (max > 0 ? max : 1)]}
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

  let lastDataIndex = -1;
  points.forEach((point, index) => {
    if (Number(point.total) > 0) lastDataIndex = index;
  });
  const scrollProps = {
    minWidth,
    bucketWidth: minBucketWidth,
    focusIndex: lastDataIndex,
    bucketCount: points.length,
  };

  if (isLine) {
    const [series] = metric.series;

    return (
      <ChartScroller {...scrollProps}>
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
              isAnimationActive={!prefersReduced}
              animationDuration={Math.round(MOTION_DURATION.chart * 1000)}
              animationEasing="ease-out"
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
      <ChartScroller {...scrollProps}>
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

            {metric.series.map((series, seriesIndex) => {
              const topRadius = hasBreakdown
                ? GROUPED_BAR.radius
                : SINGLE_BAR.radius;

              return (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  fill={`var(--color-${series.key})`}
                  radius={[topRadius, topRadius, 0, 0]}
                  maxBarSize={
                    hasBreakdown
                      ? GROUPED_BAR.maxBarSize
                      : SINGLE_BAR.maxBarSize
                  }
                  isAnimationActive={false}
                  shape={(barProps: unknown) => {
                    const shapeProps = barProps as {
                      x?: number;
                      y?: number;
                      width?: number;
                      height?: number;
                      fill?: string;
                      index?: number;
                    };
                    return (
                      <AnimatedBarShape
                        {...shapeProps}
                        topRadius={topRadius}
                        seriesIndex={seriesIndex}
                        barSequence={barSequence}
                        prefersReduced={prefersReduced}
                      />
                    );
                  }}
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
              );
            })}
          </BarChart>
        </ChartContainer>
      </ChartScroller>

      {hasBreakdown && showLegend && <ChartLegendRow metric={metric} />}
    </div>
  );
};

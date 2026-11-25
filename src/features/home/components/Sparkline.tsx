import { motion, useReducedMotion } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const WIDTH = 96;
const HEIGHT = 32;

type SparklineProps = {
  /** ค่าแกน Y ของแต่ละจุดใน viewBox 96x32 (0 = บนสุด) กระจายห่างเท่ากันตามแกน X */
  points: number[];
  /** สีเส้น (ใช้ currentColor ถ้าไม่ระบุ) */
  className?: string;
  /** flat = เส้นประเรียบ ใช้ตอนไม่มีความเคลื่อนไหว */
  flat?: boolean;
  /** หน่วงเวลาเริ่มวาดเส้นให้สอดคล้องกับจังหวะ stagger ของการ์ด */
  delay?: number;
};

/** กราฟเส้น minimal ข้างตัวเลขสถิติ: วาดเส้น pathLength แบบ smooth + พื้นสีจาง 8% */
export const Sparkline = ({
  points,
  className,
  flat = false,
  delay = 0.12,
}: SparklineProps) => {
  const prefersReduced = useReducedMotion();

  if (flat) {
    return (
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className={className}
        aria-hidden
      >
        <motion.path
          d={`M 0 27 L ${WIDTH} 27`}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth={1.6}
          strokeDasharray="3 4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={prefersReduced ? false : { opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          style={{ originX: 0 }}
          transition={{
            duration: MOTION_DURATION.slow,
            delay,
            ease: MOTION_EASE.out,
          }}
        />
      </svg>
    );
  }

  const step = points.length > 1 ? WIDTH / (points.length - 1) : WIDTH;
  const coords = points.map((y, i) => [Math.round(i * step), y] as const);
  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const polygonPoints = `${coords.map(([x, y]) => `${x},${y}`).join(" ")} ${WIDTH},${HEIGHT} 0,${HEIGHT}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <motion.polygon
        points={polygonPoints}
        fill="currentColor"
        initial={prefersReduced ? { fillOpacity: 0.08 } : { fillOpacity: 0 }}
        animate={{ fillOpacity: 0.08 }}
        transition={{
          duration: MOTION_DURATION.slow,
          delay: delay + 0.22,
          ease: MOTION_EASE.out,
        }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: {
            duration: MOTION_DURATION.chart,
            delay,
            ease: MOTION_EASE.out,
          },
          opacity: {
            duration: MOTION_DURATION.fast,
            delay,
            ease: MOTION_EASE.out,
          },
        }}
      />
    </svg>
  );
};

import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "../type";

const BURST_DOTS = Array.from({ length: 10 }, (_, index) => index);
const SPRING = { type: "spring", stiffness: 260, damping: 18 } as const;

const TONE: Record<ConnectionStatus, string> = {
  idle: "bg-primary/10 text-icons",
  testing: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  connected: "bg-green-500 text-white shadow-lg shadow-green-500/30",
  failed: "bg-red-500 text-white shadow-lg shadow-red-500/25",
};

const RING: Record<ConnectionStatus, string> = {
  idle: "",
  testing: "border-blue-400",
  connected: "border-green-400",
  failed: "border-red-400",
};

const Check = ({ animate }: { animate: boolean }) => (
  <svg viewBox="0 0 24 24" className="size-9" fill="none" aria-hidden>
    <motion.path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={animate ? { pathLength: 0 } : false}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
    />
  </svg>
);

const Cross = ({ animate }: { animate: boolean }) => (
  <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
    {["M7 7l10 10", "M17 7L7 17"].map((d, index) => (
      <motion.path
        key={d}
        d={d}
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay: 0.12 + index * 0.12 }}
      />
    ))}
  </svg>
);

/** วงกลมสถานะ: ตรวจสอบหมุน, สำเร็จติ๊กถูกพร้อมคลื่นและประกาย, ไม่สำเร็จสั่นเบา ๆ */
export const StatusVisual = ({
  status,
  celebrate,
}: {
  status: ConnectionStatus;
  /** เพิ่งบันทึกสำเร็จในหน้านี้ ให้เล่นประกายฉลอง ไม่ใช่แค่โหลดหน้ามาเจอว่าเชื่อมต่อแล้ว */
  celebrate: boolean;
}) => {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;
  const pulsing = animate && (status === "testing" || status === "connected");

  return (
    <div className="relative flex size-24 items-center justify-center">
      {pulsing &&
        [0, 1].map((index) => (
          <motion.span
            key={index}
            className={cn("absolute inset-2 rounded-full border-2", RING[status])}
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{
              duration: 1.8,
              delay: index * 0.9,
              repeat: status === "testing" ? Infinity : 2,
              ease: "easeOut",
            }}
          />
        ))}

      {animate && celebrate && status === "connected" &&
        BURST_DOTS.map((index) => {
          const angle = (index / BURST_DOTS.length) * Math.PI * 2;
          return (
            <motion.span
              key={index}
              className={cn(
                "absolute size-2 rounded-full",
                index % 2 ? "bg-green-400" : "bg-amber-300"
              )}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos(angle) * 54,
                y: Math.sin(angle) * 54,
                scale: [0, 1.2, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
            />
          );
        })}

      <motion.div
        className={cn(
          "relative flex size-[72px] items-center justify-center rounded-full",
          TONE[status]
        )}
        initial={animate ? { scale: 0.4, opacity: 0 } : false}
        animate={
          status === "failed" && animate
            ? { scale: 1, opacity: 1, x: [0, -7, 7, -5, 5, 0] }
            : { scale: 1, opacity: 1 }
        }
        transition={status === "failed" ? { duration: 0.5 } : SPRING}
      >
        {status === "idle" && <Plug className="size-8" />}
        {status === "testing" && <Loader2 className="size-8 animate-spin" />}
        {status === "connected" && <Check animate={animate} />}
        {status === "failed" && <Cross animate={animate} />}
      </motion.div>
    </div>
  );
};

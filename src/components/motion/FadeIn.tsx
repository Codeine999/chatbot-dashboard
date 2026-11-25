import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE, MOTION_VIEWPORT } from "@/lib/motion";

type FadeInTag = "div" | "section" | "header";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  as?: FadeInTag;
  /** ระยะยกตัวแนวตั้งเริ่มต้น (px) */
  y?: number;
  delay?: number;
  duration?: number;
  /** true = เริ่มแสดงเมื่อเลื่อนเข้า viewport (เหมาะกับ section ด้านล่าง) */
  inView?: boolean;
};

const TAG_MAP = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
} as const;

/**
 * Wrapper เปิดตัว section/block แบบ fade-up นุ่มนวล
 * เคารพ prefers-reduced-motion อัตโนมัติ
 */
export const FadeIn = ({
  children,
  className,
  as = "div",
  y = 14,
  delay = 0,
  duration = MOTION_DURATION.base,
  inView = false,
}: FadeInProps) => {
  const prefersReduced = useReducedMotion();
  const Component = TAG_MAP[as];

  if (prefersReduced) {
    return <Component className={className}>{children}</Component>;
  }

  const transition = {
    duration,
    delay,
    ease: MOTION_EASE.out,
  };

  if (inView) {
    return (
      <Component
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={MOTION_VIEWPORT}
        transition={transition}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      {children}
    </Component>
  );
};

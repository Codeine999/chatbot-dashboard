import type { Transition, Variants } from "framer-motion";

/**
 * ระบบ Motion Design กลางสไตล์ Minimal Modern SaaS (โทน ElevenLabs)
 * - จังหวะช้าและนุ่มนวล (slow & smooth) ชะลอปลายยาวเนียนตา ไม่มีอาการกระชาก
 * - แอนิเมชันเฉพาะ GPU-composited properties (transform, opacity, pathLength)
 */
export const MOTION_EASE = {
  /** โค้งหลัก: ease-out-expo ปลายยาว นุ่มและนิ่งแบบ editorial SaaS */
  out: [0.16, 1, 0.3, 1] as const,
  /** ใช้กับ state transition สองทาง */
  inOut: [0.4, 0, 0.2, 1] as const,
};

export const MOTION_DURATION = {
  instant: 0.18,
  fast: 0.3,
  base: 0.52,
  slow: 0.7,
  chart: 0.95,
} as const;

export const MOTION_SPRING = {
  /** ใช้กับแถบ pill ที่เลื่อนตาม layoutId ให้ไหลลื่นนุ่มมือไม่ดีด */
  tab: {
    type: "spring",
    stiffness: 340,
    damping: 33,
    mass: 0.85,
  } satisfies Transition,
  /** ใช้กับ micro-interaction เช่น ไอคอนเปลี่ยนสถานะ / ปุ่มกด */
  snappy: {
    type: "spring",
    stiffness: 350,
    damping: 30,
    mass: 0.85,
  } satisfies Transition,
};

export const MOTION_VIEWPORT = {
  once: true,
  amount: "some",
} as const;

export const createFadeUpVariants = (
  y = 14,
  duration: number = MOTION_DURATION.base
): Variants => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: MOTION_EASE.out,
    },
  },
});

export const createStaggerVariants = (
  staggerChildren = 0.07,
  delayChildren = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const createStaggerItemVariants = ({
  y = 14,
  x = 0,
  duration = MOTION_DURATION.base,
}: {
  y?: number;
  x?: number;
  duration?: number;
} = {}): Variants => ({
  hidden: { opacity: 0, y, x },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration,
      ease: MOTION_EASE.out,
    },
  },
});

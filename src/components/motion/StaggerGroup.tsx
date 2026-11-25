import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  MOTION_DURATION,
  MOTION_VIEWPORT,
  createStaggerItemVariants,
  createStaggerVariants,
} from "@/lib/motion";

type GroupTag = "div" | "ul";
type ItemTag = "div" | "li";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  as?: GroupTag;
  stagger?: number;
  delayChildren?: number;
  inView?: boolean;
};

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: ItemTag;
  y?: number;
  x?: number;
  duration?: number;
};

const GROUP_MAP = {
  div: motion.div,
  ul: motion.ul,
} as const;

const ITEM_MAP = {
  div: motion.div,
  li: motion.li,
} as const;

/**
 * คอนเทนเนอร์จัดจังหวะเปิดตัวลูกทีละชิ้น (KPI grid, list rows)
 */
export const StaggerGroup = ({
  children,
  className,
  as = "div",
  stagger = 0.07,
  delayChildren = 0,
  inView = false,
}: StaggerGroupProps) => {
  const prefersReduced = useReducedMotion();
  const Component = GROUP_MAP[as];

  if (prefersReduced) {
    return <Component className={className}>{children}</Component>;
  }

  const variants = createStaggerVariants(stagger, delayChildren);

  if (inView) {
    return (
      <Component
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={MOTION_VIEWPORT}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </Component>
  );
};

export const StaggerItem = ({
  children,
  className,
  as = "div",
  y = 14,
  x = 0,
  duration = MOTION_DURATION.base,
}: StaggerItemProps) => {
  const prefersReduced = useReducedMotion();
  const Component = ITEM_MAP[as];

  if (prefersReduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      variants={createStaggerItemVariants({ y, x, duration })}
    >
      {children}
    </Component>
  );
};

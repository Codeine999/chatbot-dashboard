import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/i18n/format";
import { MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type AnimatedNumberProps = {
  value: number;
  /** ฟังก์ชันแปลงตัวเลขเป็นข้อความ (ค่าเริ่มต้นใช้ formatNumber ของ i18n) */
  format?: (value: number) => string;
  /** จำนวนตำแหน่งทศนิยมระหว่างวิ่ง (0 = ปัดเป็นจำนวนเต็ม) */
  decimals?: number;
  duration?: number;
  className?: string;
};

/**
 * ตัวเลขวิ่งเนียนระดับ 60fps โดยอัปเดต textContent ผ่าน ref โดยตรง
 * ไม่ทำให้ React re-render ระหว่างเฟรม และคงค่าจริงเต็มทศนิยมเมื่อวิ่งจบ
 */
export const AnimatedNumber = ({
  value,
  format = formatNumber,
  decimals = 0,
  duration = 0.9,
  className,
}: AnimatedNumberProps) => {
  const prefersReduced = useReducedMotion();
  const spanRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const formatRef = useRef(format);
  formatRef.current = format;

  const finalFormatted = format(value);
  // ตรึงข้อความเริ่มต้นไว้ครั้งเดียว เพื่อไม่ให้ React reconciler เขียนทับ textContent ตอน re-render
  const [initialText] = useState(() =>
    prefersReduced ? finalFormatted : format(0)
  );

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    if (prefersReduced || motionValue.get() === value) {
      motionValue.set(value);
      node.textContent = finalFormatted;
      return;
    }

    const factor = 10 ** decimals;
    const controls = animate(motionValue, value, {
      duration,
      ease: MOTION_EASE.out,
      onUpdate: (latest) => {
        const rounded = Math.round(latest * factor) / factor;
        node.textContent = formatRef.current(rounded);
      },
      onComplete: () => {
        node.textContent = finalFormatted;
      },
    });

    return () => controls.stop();
  }, [value, decimals, duration, motionValue, prefersReduced, finalFormatted]);

  return (
    <span ref={spanRef} className={cn("tabular-nums", className)}>
      {initialText}
    </span>
  );
};

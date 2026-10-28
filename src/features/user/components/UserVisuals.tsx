import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { UserPlan, UserStatus } from "../type";

/** สีพื้นของอักษรย่อ วนตามชื่อ คนเดิมจึงได้สีเดิมทุกครั้ง */
const AVATAR_TONES = [
  "bg-primary/10 text-icons",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
];

const toneOf = (seed: string) => {
  const sum = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
};

export const UserAvatar = ({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) => {
  // โหลดรูปไม่ได้ (ลิงก์หมดอายุ หรือ LINE ไม่ส่งรูปมา) ให้ใช้อักษรแรกของชื่อแทน
  // เก็บ src ที่พังไว้แทน boolean เพื่อให้ src ใหม่ได้ลองโหลดอีกครั้ง
  const [failedSrc, setFailedSrc] = useState<string>();

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailedSrc(src)}
        className={cn("size-9 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        toneOf(name),
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
};

/** โลโก้ LINE ย่อ วาดเป็น svg จะได้ไม่ต้องพึ่งไฟล์ภาพ */
export const LineMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "flex size-4 shrink-0 items-center justify-center rounded-[5px] bg-[#06C755]",
      className
    )}
  >
    <svg viewBox="0 0 24 24" className="size-3 fill-white">
      <path d="M12 3C6.9 3 3 6.3 3 10.3c0 3.6 3.1 6.6 7.3 7.2.3.1.7.2.8.5.1.3.1.6 0 .9l-.1.8c0 .2-.2.9.8.5s5.2-3.1 7.1-5.3c1.3-1.4 1.9-2.9 1.9-4.6C20.8 6.3 16.9 3 12 3Z" />
    </svg>
  </span>
);

const PLAN_TONES: Record<UserPlan, string> = {
  starter: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  pro: "bg-primary/10 text-icons",
  business: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};

export const PlanBadge = ({ plan }: { plan: UserPlan }) => {
  const { t } = useTranslation("users");

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        PLAN_TONES[plan]
      )}
    >
      {t(`plan.${plan}`)}
    </span>
  );
};

const STATUS_TONES: Record<UserStatus, { chip: string; dot: string }> = {
  pending: {
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  active: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  paused: {
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  inactive: {
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

export const StatusBadge = ({ status }: { status: UserStatus }) => {
  const { t } = useTranslation("users");
  const tone = STATUS_TONES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        tone.chip
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone.dot)} />
      {t(`status.${status}`)}
    </span>
  );
};

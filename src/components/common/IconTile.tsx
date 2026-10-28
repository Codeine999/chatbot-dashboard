import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconTileVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    tone: {
      primary: "bg-primary/10 text-icons",
      success: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      info: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      danger: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      neutral: "bg-hover text-mini",
    },
    size: {
      /** การ์ดสถิติ การ์ดทางเลือก */
      sm: "size-10 rounded-xl [&_svg]:size-5",
      /** หัวหน้า */
      md: "size-11 rounded-xl [&_svg]:size-5",
      /** empty state */
      lg: "size-14 rounded-2xl [&_svg]:size-6",
    },
  },
  defaultVariants: { tone: "primary", size: "md" },
});

export type IconTileTone = NonNullable<VariantProps<typeof iconTileVariants>["tone"]>;

type Props = VariantProps<typeof iconTileVariants> & {
  icon: LucideIcon;
  className?: string;
};

/** กล่องไอคอนพื้นสีอ่อน ใช้ทั้งหัวหน้า การ์ดสถิติ และ empty state ให้หน้าตาเหมือนกันทุกที่ */
export const IconTile = ({ icon: Icon, tone, size, className }: Props) => (
  <span className={cn(iconTileVariants({ tone, size }), className)} aria-hidden>
    <Icon />
  </span>
);

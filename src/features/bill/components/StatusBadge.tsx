import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "../type";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
};

export const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const { label, icon: Icon, className } = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        className
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
};

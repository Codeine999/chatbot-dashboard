import type { ReactNode } from "react";
import { FormItem, FormMessage } from "@/components/ui/form";

/** label + ช่องกรอก + ข้อความ error + คำอธิบาย ต้องอยู่ใต้ <FormField> */
export const CredentialField = ({
  label,
  badge,
  hint,
  counter,
  children,
}: {
  label: string;
  badge?: ReactNode;
  hint?: string;
  counter?: string;
  children: ReactNode;
}) => (
  <FormItem className="min-w-0 gap-0">
    <p className="mb-1.5 flex items-center gap-2 text-sm font-medium text-normal">
      {label}
      <span className="text-red-500" aria-hidden>
        *
      </span>
      {badge}
    </p>

    {children}

    <FormMessage className="mt-1.5 text-xs" />
    <div className="mt-1.5 flex items-start justify-between gap-3">
      <p className="text-xs text-mini">{hint}</p>
      {counter && (
        <p className="shrink-0 text-xs tabular-nums text-mini">{counter}</p>
      )}
    </div>
  </FormItem>
);

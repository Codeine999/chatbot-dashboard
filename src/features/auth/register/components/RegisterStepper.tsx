import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Account Credentials" },
  { id: 2, label: "Personal Information" },
  { id: 3, label: "Company Information" },
] as const;

export const RegisterStepper = ({ step }: { step: 1 | 2 | 3 }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((s, i) => (
      <Fragment key={s.id}>
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={cn(
              "size-8 rounded-full flex items-center justify-center text-sm font-semibold border",
              step >= s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-gray-300 text-gray-400"
            )}
          >
            {step > s.id ? <Check className="size-4" /> : s.id}
          </div>
          <span
            className={cn(
              "text-xs whitespace-nowrap",
              step === s.id ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            {s.label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={cn(
              "h-0.5 w-10 -mt-5",
              step > s.id ? "bg-primary" : "bg-gray-200"
            )}
          />
        )}
      </Fragment>
    ))}
  </div>
);

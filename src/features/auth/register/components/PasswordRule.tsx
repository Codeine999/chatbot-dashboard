import { Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const PasswordRule = ({ met, label }: { met: boolean; label: string }) => (
  <div className={cn("flex items-center gap-1.5", met && "text-green-600")}>
    {met ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
    <span>{label}</span>
  </div>
);

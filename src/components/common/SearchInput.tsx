import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"input"> & {
  /** class ของกรอบนอก ส่วน className ใช้กับ input */
  wrapperClassName?: string;
};

export const SearchInput = ({ wrapperClassName, className, ...props }: Props) => (
  <div className={cn("relative", wrapperClassName)}>
    <Search
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mini"
      aria-hidden
    />
    <Input type="search" className={cn("pl-9", className)} {...props} />
  </div>
);

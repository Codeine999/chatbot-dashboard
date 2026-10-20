import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** แถว ชื่อ + คำอธิบาย + สวิตช์ ชิดขวา */
export const SwitchField = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: Props) => {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-normal">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-xs text-mini">
            {description}
          </p>
        )}
      </div>

      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
      />
    </div>
  );
};

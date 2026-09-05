import { GripVertical, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { SidebarMenuOption } from "../type";

type Props = {
  option: SidebarMenuOption;
  onToggle: (id: string, enabled: boolean) => void;
};

export const MenuOptionRow = ({ option, onToggle }: Props) => (
  <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border text-normal">
      <option.icon className="size-4.5" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold text-normal">{option.title}</p>
        {option.badge && (
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {option.badge}
          </span>
        )}
      </div>
      <p className="mt-0.5 truncate text-xs text-mini">{option.description}</p>
    </div>

    {option.required && (
      <span className="flex shrink-0 items-center gap-1 text-xs text-mini">
        Required
        <Lock className="size-3.5" />
      </span>
    )}

    <Switch
      checked={option.enabled}
      disabled={option.required}
      onCheckedChange={(checked) => onToggle(option.id, checked)}
      aria-label={`Toggle ${option.title}`}
    />

    {/* ตัวจับลาก (ยังเป็น affordance เฉย ๆ ยังไม่ผูก drag-and-drop จริง) */}
    <GripVertical className="size-4 shrink-0 cursor-grab text-mini/60" />
  </div>
);

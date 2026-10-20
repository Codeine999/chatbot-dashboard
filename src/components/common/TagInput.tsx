import { useState, type ComponentProps } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
  /** class ของกรอบนอก ส่วน className ใช้กับ input */
  wrapperClassName?: string;
};

/** กรอกแท็กทีละคำ กด Enter หรือ , เพื่อเพิ่ม กด Backspace ตอนช่องว่างเพื่อลบอันล่าสุด */
export const TagInput = ({
  value,
  onChange,
  maxTags = Infinity,
  wrapperClassName,
  className,
  disabled,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const commit = () => {
    const tag = text.trim();
    setText("");
    if (!tag || value.includes(tag) || value.length >= maxTags) return;
    onChange([...value, tag]);
  };

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag));

  return (
    <div
      className={cn(
        "w-full rounded-md border border-input px-3 py-2 shadow-xs transition-[color,box-shadow] dark:bg-input/30",
        "focus-within:border-ring focus-within:ring-[1px] focus-within:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        wrapperClassName
      )}
    >
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md bg-hover px-2 py-1 text-xs text-normal"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={t("actions.removeItem", { name: tag })}
                className="cursor-pointer text-mini transition hover:text-red-500"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={text}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          // ระหว่างพิมพ์ด้วย IME (เช่นภาษาญี่ปุ่น) Enter คือการยืนยันตัวอักษร ไม่ใช่การเพิ่มแท็ก
          if (event.nativeEvent.isComposing) return;

          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Backspace" && !text && value.length > 0) {
            remove(value[value.length - 1]);
          }
        }}
        className={cn(
          "w-full bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
};

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  disabled: boolean;
  isThinking: boolean;
  aiEnabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

/** กล่องพิมพ์ข้อความ แบบเรียบ ขอบบางไม่มีเงา ขยายความสูงตามข้อความ */
export const ChatComposer = ({
  value,
  disabled,
  isThinking,
  aiEnabled,
  onChange,
  onSend,
}: Props) => {
  const { t } = useTranslation("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  return (
    <div className="rounded-[1.25rem] border bg-card px-3 pb-3 pt-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors focus-within:border-foreground/25">
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        disabled={!aiEnabled}
        placeholder={aiEnabled ? t("composer.placeholder") : t("composer.disabled")}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        className="max-h-44 min-h-14 w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 text-normal outline-none placeholder:text-mini disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-1 flex items-center justify-end gap-3">
        <Button
          type="button"
          size="icon"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="size-8 rounded-lg"
          aria-label={t("composer.send")}
        >
          {isThinking ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

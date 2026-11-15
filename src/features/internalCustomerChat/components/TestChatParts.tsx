import type { ReactNode } from "react";
import { ArrowUp, LoaderCircle, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

/** กล่องแจ้งเตือนสีอุ่นใต้หัวหน้า (พื้น #f5f2ef) ข้อความ `code` แสดงเป็นชิป mono */
export function NoticeBox({ children }: { children: string }) {
  const parts = children.split(/(`[^`]+`|[A-Z][A-Z0-9_]{6,})/g);
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#f5f2ef] px-4 py-3 text-[13px] leading-relaxed text-normal dark:bg-white/5">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#c2410c]" />
      <p className="text-inherit">
        {parts.map((part, index) =>
          /^[A-Z][A-Z0-9_]{6,}$/.test(part) ? (
            <code
              key={index}
              className="rounded-md bg-black/5 px-1.5 py-0.5 font-mono text-xs text-foreground dark:bg-white/10"
            >
              {part}
            </code>
          ) : (
            part
          )
        )}
      </p>
    </div>
  );
}

/** ไอคอนวงกลมประของหัวห้องแชท */
export function DashedAvatar({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground">
      {children}
    </span>
  );
}

export const messageBubbleClass = (side: "customer" | "other") =>
  `max-w-[85%] rounded-2xl px-4 py-2.5 bg-muted text-foreground ${
    side === "customer" ? "rounded-br-md" : "rounded-bl-md"
  }`;

export function EmptyConversation({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-dashed text-muted-foreground">
        <ArrowUp className="size-5 rotate-45" />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SendingNote() {
  const { t } = useTranslation("chat");
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" />
      {t("customerTest.sending")}
    </p>
  );
}

/** กล่อง composer: ขอบมน 16 เงาบาง ๆ */
export const composerBoxClass =
  "mx-auto w-full max-w-[880px] rounded-2xl border bg-background p-3 shadow-[0_4px_14px_rgba(0,0,0,0.04)]";

export const composerTextareaClass =
  "field-sizing-fixed min-h-0 resize-none border-0 bg-transparent p-1 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent";

export function SendButton({ disabled, label }: { disabled: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ArrowUp className="size-4" />
      {label}
    </button>
  );
}

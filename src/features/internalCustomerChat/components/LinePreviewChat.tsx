import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, MessageCircle, Plus, RefreshCw, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import { useCustomerPreviewChat } from "../hooks/useCustomerPreviewChat";
import { PreviewDebugPanel } from "./PreviewDebugPanel";

/** ช่อง LINE: userview เดิม (จำลองลูกค้า ไม่บันทึกประวัติแชท LINE) */
export function LinePreviewChat({ active, tabs }: { active: boolean; tabs: ReactNode }) {
  const { t } = useTranslation("chat");
  const chat = useCustomerPreviewChat();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const disabled = chat.isSending || chat.isStarting || chat.aiDisabled || !chat.sessionId;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [chat.messages.length, chat.isSending]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || disabled) return;
    setDraft("");
    const ok = await chat.send(text);
    // ส่งไม่สำเร็จ คืนข้อความให้แก้หรือส่งใหม่ได้ (ยกเว้นกรณี retry ที่เก็บไว้ในปุ่มลองใหม่)
    if (!ok) setDraft((current) => current || text);
  };

  return (
    <div className={active ? undefined : "hidden"}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 basis-80 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          {t("customerTest.creditNote")}
        </p>
        <Button
          variant="outline"
          disabled={chat.isSending || chat.isStarting}
          onClick={() => void chat.restart()}
        >
          <Plus className="size-4" />
          {t("customerTest.newChat")}
        </Button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border bg-card p-5">
          {tabs}
          <PreviewDebugPanel sessionId={chat.sessionId} />
        </aside>

        <section className="flex h-[min(700px,80svh)] min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-card">
          <header className="flex items-center gap-3 border-b p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle />
            </div>
            <div>
              <h2 className="font-semibold">{t("customerTest.customerView")}</h2>
              <p className="text-xs text-muted-foreground">{t("customerTest.viewHint")}</p>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/30 p-5" role="log" aria-live="polite">
            {chat.isStarting && chat.messages.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                {t("customerTest.starting")}
              </p>
            ) : chat.messages.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title={t("customerTest.empty")}
                description={t("customerTest.emptyHint")}
                className="h-full justify-center"
              />
            ) : null}

            {chat.messages.map((message) => {
              if (message.kind === "notice") {
                return (
                  <p
                    key={message.id}
                    className={`text-center text-xs ${
                      message.tone === "warning" ? "text-amber-600" : "text-muted-foreground"
                    }`}
                  >
                    {message.text}
                  </p>
                );
              }

              const isCustomer = message.kind === "customer";
              return (
                <div key={message.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      isCustomer
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm border bg-card"
                    }`}
                  >
                    <p className="mb-1 flex items-center gap-2 text-[10px] opacity-70">
                      {t(isCustomer ? "customerTest.you" : "customerTest.assistant")}
                      {message.kind === "bot" && (
                        <span className="rounded bg-hover px-1.5 py-0.5 font-mono uppercase">
                          {message.source}
                        </span>
                      )}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {chat.isSending && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                {t("customerTest.sending")}
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="border-t p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            {chat.error && (
              <div role="alert" className="mb-3 flex flex-wrap items-center gap-3 text-sm text-destructive">
                <span>{chat.error}</span>
                {chat.failedSend && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={chat.isSending}
                    onClick={() => void chat.send(chat.failedSend!.text, chat.failedSend)}
                  >
                    <RefreshCw className="size-3.5" />
                    {t("customerTest.retry")}
                  </Button>
                )}
              </div>
            )}
            <Textarea
              aria-label={t("customerTest.placeholder")}
              placeholder={chat.aiDisabled ? t("customerTest.aiDisabled") : t("customerTest.placeholder")}
              value={draft}
              maxLength={5000}
              disabled={disabled}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void submit();
                }
              }}
              className="min-h-20 resize-none"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{t("customerTest.enterHint")}</p>
              <Button type="submit" disabled={disabled || !draft.trim()}>
                <Send className="size-4" />
                {t("customerTest.send")}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, MessageCircle, Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerPreviewChat } from "../hooks/useCustomerPreviewChat";
import { PreviewDebugPanel } from "./PreviewDebugPanel";
import {
  DashedAvatar,
  EmptyConversation,
  NoticeBox,
  SendButton,
  SendingNote,
  composerBoxClass,
  composerTextareaClass,
  messageBubbleClass,
} from "./TestChatParts";

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
      <div className="flex flex-wrap items-center gap-3 pt-5">
        <div className="min-w-0 flex-1 basis-80">
          <NoticeBox>{t("customerTest.creditNote")}</NoticeBox>
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-[10px]"
          disabled={chat.isSending || chat.isStarting}
          onClick={() => void chat.restart()}
        >
          <Plus className="size-4" />
          {t("customerTest.newChat")}
        </Button>
      </div>

      <div className="mt-5 grid h-[min(900px,calc(100svh-18rem))] min-h-[520px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-b pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
          {tabs}
          <div className="pt-4">
            <PreviewDebugPanel sessionId={chat.sessionId} />
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="flex min-h-16 items-center gap-3 border-b px-6">
            <DashedAvatar>
              <MessageCircle className="size-[18px]" />
            </DashedAvatar>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">{t("customerTest.customerView")}</h2>
              <p className="text-xs text-muted-foreground">{t("customerTest.viewHint")}</p>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5" role="log" aria-live="polite">
            {chat.isStarting && chat.messages.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                {t("customerTest.starting")}
              </p>
            ) : chat.messages.length === 0 ? (
              <EmptyConversation title={t("customerTest.empty")} hint={t("customerTest.emptyHint")} />
            ) : null}

            {chat.messages.map((message) => {
              if (message.kind === "notice") {
                return (
                  <p
                    key={message.id}
                    className={`text-center text-xs ${
                      message.tone === "warning" ? "text-[#c2410c]" : "text-muted-foreground"
                    }`}
                  >
                    {message.text}
                  </p>
                );
              }

              const isCustomer = message.kind === "customer";
              return (
                <div key={message.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                  <div className={messageBubbleClass(isCustomer ? "customer" : "other")}>
                    <p className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {t(isCustomer ? "customerTest.you" : "customerTest.assistant")}
                      {message.kind === "bot" && (
                        <span className="rounded bg-background px-1.5 py-0.5 font-mono uppercase">
                          {message.source}
                        </span>
                      )}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                      {message.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {chat.isSending && <SendingNote />}
            <div ref={endRef} />
          </div>

          <form
            className="px-6 pb-5 pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            {chat.error && (
              <div role="alert" className="mx-auto mb-3 flex max-w-[1200px] flex-wrap items-center gap-3 text-sm text-destructive">
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
            <div className={composerBoxClass}>
              <Textarea
                aria-label={t("customerTest.placeholder")}
                placeholder={chat.aiDisabled ? t("customerTest.aiDisabled") : t("customerTest.placeholder")}
                value={draft}
                rows={2}
                maxLength={5000}
                disabled={disabled}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                className={composerTextareaClass}
              />
              <div className="mt-2 flex items-center justify-between gap-3 px-1">
                <p className="text-xs text-muted-foreground">{t("customerTest.enterHint")}</p>
                <SendButton disabled={disabled || !draft.trim()} label={t("customerTest.send")} />
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

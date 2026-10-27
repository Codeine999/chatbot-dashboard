import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, MessageCircle, Pause, Play, RefreshCw, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useAppBotMode,
  useAppConversations,
  useAppGuest,
  useAppMessages,
  usePollAppMessages,
  useSendAppAdminMessage,
} from "../hooks/useAppChat";
import type { AppHistoryMessage } from "../type";
import { AppMessageBubble } from "./AppMessageBubble";
import { AppRoomList } from "./AppRoomList";

type SendAs = "customer" | "admin";

/** ข้อความที่เพิ่งส่งแต่ backend ยังไม่คืนประวัติ (รอ AI ตอบอยู่) */
type Pending = { text: string; knownIds: Set<string> };

/**
 * ช่อง line-application: ห้องแชทและประวัติมาจาก backend จริง
 * - ส่งในนามลูกค้า = ลูกค้าจำลองของแท็บนี้เรียก guest API (เหมือนแอปลูกค้า)
 * - ส่งในนามแอดมิน = ตอบห้องที่เลือกผ่าน admin inbox
 */
export function ApplicationChat({ active, tabs }: { active: boolean; tabs: ReactNode }) {
  const { t } = useTranslation("chat");
  const guest = useAppGuest(active);
  const rooms = useAppConversations(active);

  // undefined = ตามห้องของลูกค้าจำลอง, null = ผู้ใช้กดเริ่มแชทใหม่ (ยังไม่มีห้อง)
  const [picked, setPicked] = useState<string | null | undefined>();
  const roomId = picked === undefined ? guest.conversationId : (picked ?? undefined);

  const messagesQuery = useAppMessages(roomId, active);
  usePollAppMessages(roomId, active);
  const messages = useMemo<AppHistoryMessage[]>(
    () => [...(messagesQuery.data?.pages ?? [])].reverse().flat(),
    [messagesQuery.data]
  );

  const adminSend = useSendAppAdminMessage(roomId);
  const botMode = useAppBotMode(roomId);

  const [draft, setDraft] = useState("");
  const [sendAs, setSendAs] = useState<SendAs>("customer");
  const [pending, setPending] = useState<Pending>();
  const endRef = useRef<HTMLDivElement>(null);

  const room = rooms.data?.find((item) => item.id === roomId);
  const isMine = Boolean(roomId) && roomId === guest.conversationId;
  const canCustomer = !roomId || isMine;
  const canAdmin = Boolean(roomId);
  const mode: SendAs = !canCustomer ? "admin" : !canAdmin ? "customer" : sendAs;

  const busy = guest.isSending || adminSend.isPending;
  const lastId = messages.at(-1)?.id;

  // ข้อความที่ส่งไปแล้วและมีในประวัติแล้ว ไม่ต้องแสดงซ้ำเป็น pending
  const showPending =
    pending &&
    !messages.some(
      (message) =>
        message.sender.toLowerCase() === "user" &&
        message.text === pending.text &&
        !pending.knownIds.has(message.id)
    );

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [roomId, lastId, showPending, guest.isSending]);

  const sendCustomer = async (text: string, retry?: Parameters<typeof guest.send>[1]) => {
    setPending({
      text,
      knownIds: new Set(
        messages
          .filter((message) => message.sender.toLowerCase() === "user" && message.text === text)
          .map((message) => message.id)
      ),
    });
    const conversationId = await guest.send(text, retry);
    if (conversationId) setPicked(conversationId);
    setPending(undefined);
    return Boolean(conversationId);
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");

    const ok =
      mode === "admin"
        ? await adminSend.mutateAsync(text).then(
            () => true,
            () => false
          )
        : await sendCustomer(text);
    // ส่งไม่สำเร็จ คืนข้อความให้แก้หรือส่งใหม่ได้
    if (!ok) setDraft((current) => current || text);
  };

  const startNewRoom = async () => {
    await guest.restart();
    setPicked(null);
    setSendAs("customer");
    setDraft("");
  };

  return (
    <div className={active ? undefined : "hidden"}>
      <p className="mb-5 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        {t("appChat.creditNote")}
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="flex h-[min(700px,80svh)] min-h-[480px] flex-col rounded-2xl border bg-card p-5">
          {tabs}
          <AppRoomList
            rooms={rooms.data}
            isLoading={rooms.isLoading}
            error={rooms.isError}
            selectedId={roomId}
            mineId={guest.conversationId}
            newDisabled={busy}
            onSelect={(id) => {
              setPicked(id);
              setSendAs(id === guest.conversationId ? "customer" : "admin");
            }}
            onNew={() => void startNewRoom()}
          />
        </aside>

        <section className="flex h-[min(700px,80svh)] min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-card">
          <header className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">
                {room
                  ? room.contact.displayName || room.contact.id.slice(0, 8)
                  : t("appChat.newCustomer")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {roomId
                  ? isMine && guest.botMode === "admin"
                    ? t("appChat.botMuted")
                    : t("appChat.channelHint")
                  : t("appChat.newCustomerHint")}
              </p>
            </div>
            {roomId && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={botMode.pause.isPending}
                  onClick={() => botMode.pause.mutate()}
                >
                  <Pause className="size-3.5" />
                  {t("appChat.pauseBot")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={botMode.resume.isPending}
                  onClick={() => botMode.resume.mutate()}
                >
                  <Play className="size-3.5" />
                  {t("appChat.resumeBot")}
                </Button>
              </div>
            )}
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/30 p-5" role="log" aria-live="polite">
            {messagesQuery.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={messagesQuery.isFetchingNextPage}
                  onClick={() => void messagesQuery.fetchNextPage()}
                >
                  {messagesQuery.isFetchingNextPage ? t("appChat.loadingOlder") : t("appChat.loadOlder")}
                </Button>
              </div>
            )}

            {roomId && messagesQuery.isLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                {t("appChat.historyLoading")}
              </p>
            ) : messagesQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {t("appChat.historyError")}
              </p>
            ) : messages.length === 0 && !showPending ? (
              <EmptyState
                icon={MessageCircle}
                title={roomId ? t("appChat.emptyRoom") : t("customerTest.empty")}
                description={roomId ? undefined : t("appChat.emptyHint")}
                className="h-full justify-center"
              />
            ) : null}

            {messages.map((message) => (
              <AppMessageBubble key={message.id} message={message} />
            ))}

            {showPending && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground opacity-70">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{pending.text}</p>
                </div>
              </div>
            )}

            {guest.isSending && (
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
            {guest.error && (
              <div role="alert" className="mb-3 flex flex-wrap items-center gap-3 text-sm text-destructive">
                <span>{guest.error}</span>
                {guest.failedSend && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void sendCustomer(guest.failedSend!.text, guest.failedSend)}
                  >
                    <RefreshCw className="size-3.5" />
                    {t("customerTest.retry")}
                  </Button>
                )}
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">{t("appChat.sendAs")}</span>
              {(["customer", "admin"] as const).map((value) => {
                const allowed = value === "customer" ? canCustomer : canAdmin;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!allowed || busy}
                    aria-pressed={mode === value}
                    onClick={() => setSendAs(value)}
                    className={`rounded-full px-3 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      mode === value
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-hover"
                    }`}
                  >
                    {t(value === "customer" ? "appChat.asCustomer" : "appChat.asAdmin")}
                  </button>
                );
              })}
              {!canCustomer && (
                <span className="text-muted-foreground">{t("appChat.realCustomerRoom")}</span>
              )}
            </div>

            <Textarea
              aria-label={t(mode === "admin" ? "appChat.placeholderAdmin" : "customerTest.placeholder")}
              placeholder={t(mode === "admin" ? "appChat.placeholderAdmin" : "customerTest.placeholder")}
              value={draft}
              maxLength={mode === "admin" ? 5000 : 2000}
              disabled={busy}
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
              <Button type="submit" disabled={busy || !draft.trim()}>
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

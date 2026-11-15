import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, MessageCircle, Pause, Play, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    guest.restart();
    setPicked(null);
    setSendAs("customer");
    setDraft("");
  };

  return (
    <div className={active ? undefined : "hidden"}>
      <div className="pt-5">
        <NoticeBox>{t("appChat.creditNote")}</NoticeBox>
      </div>

      <div className="mt-5 grid h-[min(900px,calc(100svh-18rem))] min-h-[520px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
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
              setSendAs(guest.select(id) ? "customer" : "admin");
            }}
            onNew={() => void startNewRoom()}
          />
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="flex min-h-16 flex-wrap items-center gap-3 border-b px-6">
            <DashedAvatar>
              <MessageCircle className="size-[18px]" />
            </DashedAvatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[15px] font-semibold text-foreground">
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
                  className="rounded-[10px]"
                  disabled={botMode.pause.isPending}
                  onClick={() => botMode.pause.mutate()}
                >
                  <Pause className="size-3.5" />
                  {t("appChat.pauseBot")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-[10px]"
                  disabled={botMode.resume.isPending}
                  onClick={() => botMode.resume.mutate()}
                >
                  <Play className="size-3.5" />
                  {t("appChat.resumeBot")}
                </Button>
              </div>
            )}
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5" role="log" aria-live="polite">
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
              <EmptyConversation
                title={roomId ? t("appChat.emptyRoom") : t("customerTest.empty")}
                hint={roomId ? undefined : t("appChat.emptyHint")}
              />
            ) : null}

            {messages.map((message) => (
              <AppMessageBubble key={message.id} message={message} />
            ))}

            {showPending && (
              <div className="flex justify-end">
                <div className={`${messageBubbleClass("customer")} opacity-70`}>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                    {pending.text}
                  </p>
                </div>
              </div>
            )}

            {guest.isSending && <SendingNote />}
            <div ref={endRef} />
          </div>

          <form
            className="px-6 pb-5 pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            {guest.error && (
              <div role="alert" className="mx-auto mb-3 flex max-w-[880px] flex-wrap items-center gap-3 text-sm text-destructive">
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

            <div className={composerBoxClass}>
              <div className="mb-2 flex flex-wrap items-center gap-2.5 px-1 text-xs">
                <span className="text-muted-foreground">{t("appChat.sendAs")}</span>
                <div role="radiogroup" className="flex rounded-[10px] bg-muted p-[3px]">
                  {(["customer", "admin"] as const).map((value) => {
                    const allowed = value === "customer" ? canCustomer : canAdmin;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        disabled={!allowed || busy}
                        aria-checked={mode === value}
                        onClick={() => setSendAs(value)}
                        className={`h-7 cursor-pointer rounded-[7px] px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          mode === value
                            ? "bg-background font-medium text-foreground shadow-[0_0_1px_rgba(0,0,0,0.4),0_4px_4px_rgba(0,0,0,0.04)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t(value === "customer" ? "appChat.asCustomer" : "appChat.asAdmin")}
                      </button>
                    );
                  })}
                </div>
                {!canCustomer && (
                  <span className="text-muted-foreground">{t("appChat.realCustomerRoom")}</span>
                )}
              </div>

              <Textarea
                aria-label={t(mode === "admin" ? "appChat.placeholderAdmin" : "customerTest.placeholder")}
                placeholder={t(mode === "admin" ? "appChat.placeholderAdmin" : "customerTest.placeholder")}
                value={draft}
                rows={2}
                maxLength={mode === "admin" ? 5000 : 2000}
                disabled={busy}
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
                <SendButton disabled={busy || !draft.trim()} label={t("customerTest.send")} />
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

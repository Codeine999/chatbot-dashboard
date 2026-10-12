import { useEffect, useRef, useState } from "react";
import { Globe, LoaderCircle, MessageCircle, Plus, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api, getApiErrorMessage } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Channel = "line" | "webapp";
type Message = { id: string; role: "customer" | "assistant"; text: string };
type Session = { customerId: string; messages: Message[]; draft: string };
const newSession = (): Session => ({ customerId: `test-${crypto.randomUUID()}`, messages: [], draft: "" });

export default function InternalCustomerChat() {
  const { t } = useTranslation("chat");
  const [channel, setChannel] = useState<Channel>("line");
  const [sessions, setSessions] = useState<Record<Channel, Session>>(() => ({ line: newSession(), webapp: newSession() }));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const session = sessions[channel];
  const update = (patch: Partial<Session>) => setSessions(current => ({ ...current, [channel]: { ...current[channel], ...patch } }));

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [channel, session.messages.length, sending]);

  const send = async () => {
    const text = session.draft.trim();
    const customerId = session.customerId.trim();
    if (!text || !customerId || busy.current) return;
    busy.current = true;
    setSending(true);
    setError("");
    try {
      // Contract for the customer test endpoint; never send through the admin chat API.
      const { data } = await api.post<{ reply?: string }>("/ai/internal-customer-chat", { channel, customerId, text }, { timeout: 120_000 });
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("invalid-response");
      setSessions(current => ({ ...current, [channel]: { ...current[channel], draft: "", messages: [...current[channel].messages,
        { id: crypto.randomUUID(), role: "customer", text },
        { id: crypto.randomUUID(), role: "assistant", text: data.reply! },
      ] } }));
    } catch (failure) {
      setError(failure instanceof Error && failure.message === "invalid-response" ? t("customerTest.invalidResponse") : getApiErrorMessage(failure, t("customerTest.sendError")));
    } finally {
      busy.current = false;
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">Customer chat · Internal test</p><h1 className="text-2xl font-semibold">{t("customerTest.title")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("customerTest.subtitle")}</p></div>
        <Button variant="outline" disabled={sending} onClick={() => { update(newSession()); setError(""); }}><Plus className="size-4" />{t("customerTest.newChat")}</Button>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-5 rounded-2xl border bg-card p-5">
          <div><h2 className="font-semibold">{t("customerTest.channel")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("customerTest.channelHint")}</p></div>
          <div className="space-y-3" role="group" aria-label={t("customerTest.channel")}>
            {(["line", "webapp"] as const).map(value => { const Icon = value === "line" ? MessageCircle : Globe; return <button key={value} type="button" aria-pressed={channel === value} disabled={sending} onClick={() => { setChannel(value); setError(""); }} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-50 ${channel === value ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"}`}><Icon className={`size-5 ${value === "line" ? "text-green-600" : "text-primary"}`} /><span><span className="block text-sm font-semibold">{value === "line" ? "LINE" : "Webapp"}</span><span className="text-xs text-muted-foreground">{t(`customerTest.${value}Hint`)}</span></span></button>; })}
          </div>
          <div><label htmlFor="customer-id" className="text-sm font-medium">{t("customerTest.customerId")}</label><Input id="customer-id" className="mt-2" value={session.customerId} disabled={sending || session.messages.length > 0} onChange={event => update({ customerId: event.target.value })} /><p className="mt-2 text-xs text-muted-foreground">{t("customerTest.identityHint")}</p></div>
          <p className="rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">{t("customerTest.apiNote")}</p>
        </aside>
        <section className="flex h-[min(700px,80svh)] min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-card">
          <header className="flex items-center gap-3 border-b p-4"><div className={`flex size-10 items-center justify-center rounded-xl ${channel === "line" ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"}`}>{channel === "line" ? <MessageCircle /> : <Globe />}</div><div><h2 className="font-semibold">{channel === "line" ? "LINE" : "Webapp"}</h2><p className="text-xs text-muted-foreground">{t("customerTest.customerView")}</p></div></header>
          <div className={`min-h-0 flex-1 space-y-4 overflow-y-auto p-5 ${channel === "line" ? "bg-sky-100/40 dark:bg-sky-950/20" : "bg-muted/30"}`} role="log" aria-live="polite">
            {session.messages.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center"><MessageCircle className="mb-4 size-10 text-muted-foreground/50" /><h3 className="font-medium">{t("customerTest.empty")}</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("customerTest.emptyHint")}</p></div>}
            {session.messages.map(message => <div key={message.id} className={`flex ${message.role === "customer" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "customer" ? channel === "line" ? "rounded-br-sm bg-green-500 text-white" : "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border bg-card"}`}><p className="mb-1 text-[10px] opacity-70">{t(message.role === "customer" ? "customerTest.you" : "customerTest.assistant")}</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p></div></div>)}
            {sending && <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("customerTest.sending")}</p>}
            <div ref={endRef} />
          </div>
          <form className="border-t p-4" onSubmit={event => { event.preventDefault(); void send(); }}>
            {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
            <Textarea aria-label={t("customerTest.placeholder")} placeholder={t("customerTest.placeholder")} value={session.draft} disabled={sending} onChange={event => update({ draft: event.target.value })} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} className="min-h-20 resize-none" />
            <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{t("customerTest.enterHint")}</p><Button type="submit" disabled={sending || !session.draft.trim() || !session.customerId.trim()}><Send className="size-4" />{t("customerTest.send")}</Button></div>
          </form>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  ChartNoAxesCombined,
  ChevronDown,
  Code2,
  FileText,
  Lightbulb,
  LoaderCircle,
  Menu,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthUser } from "@/features/auth/store/auth.store";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import {
  useAdminChatMessages,
  useAdminChatRooms,
  useDeleteAdminChatRoom,
  useMyAdminAiUsage,
  useMyAiProviderCatalog,
  useMyAiProviderSetting,
  useSendAdminChatMessage,
  useUpdateMyAiProviderSetting,
} from "./hooks/useAdminChat";
import { useLockedSidebar } from "./hooks/useLockedSidebar";
import type {
  AdminChatMessage,
  AiProviderName,
  ChatSuggestion,
} from "./type";

type ModelSelection = {
  provider: AiProviderName;
  model: string;
};

type PendingMessage = {
  id: string;
  content: string;
};

const suggestions: ChatSuggestion[] = [
  {
    icon: FileText,
    title: "สรุปเนื้อหา",
    description: "สรุปเอกสารหรือบทความให้เข้าใจง่าย",
    prompt: "ช่วยสรุปเนื้อหานี้ให้เข้าใจง่ายหน่อย",
  },
  {
    icon: Code2,
    title: "เขียนโค้ด",
    description: "ช่วยเขียนโค้ดหรือแก้ไขบัค",
    prompt: "ช่วยเขียนโค้ดให้หน่อย",
  },
  {
    icon: ChartNoAxesCombined,
    title: "วิเคราะห์ข้อมูล",
    description: "วิเคราะห์ข้อมูลและสร้าง insight",
    prompt: "ช่วยวิเคราะห์ข้อมูลชุดนี้ให้หน่อย",
  },
  {
    icon: Lightbulb,
    title: "แนะนำไอเดีย",
    description: "ช่วยระดมความคิดสร้างสรรค์",
    prompt: "ช่วยระดมไอเดียให้หน่อย",
  },
];

const createPendingId = () =>
  `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const modelValue = (selection: ModelSelection) =>
  `${selection.provider}::${selection.model}`;

const parseModelValue = (value: string): ModelSelection | undefined => {
  const separator = value.indexOf("::");
  if (separator < 1) return undefined;

  return {
    provider: value.slice(0, separator) as AiProviderName,
    model: value.slice(separator + 2),
  };
};

type ChatComposerProps = {
  value: string;
  disabled: boolean;
  isThinking: boolean;
  aiEnabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

const ChatComposer = ({
  value,
  disabled,
  isThinking,
  aiEnabled,
  onChange,
  onSend,
}: ChatComposerProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-3 pt-2 sm:px-6">
      <div className="rounded-[1.5rem] border bg-card/90 p-2.5 shadow-[0_12px_35px_rgba(38,35,70,0.10)] backdrop-blur-xl transition-shadow duration-300 focus-within:shadow-[0_16px_42px_rgba(79,57,246,0.13)] dark:bg-card/95">
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          disabled={!aiEnabled}
          placeholder={
            aiEnabled
              ? "Message your AI assistant"
              : "AI access is disabled for this account"
          }
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          className="max-h-44 min-h-14 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-normal outline-none placeholder:text-mini disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-1 flex items-center justify-between gap-3 px-1">
          <p className="truncate text-[11px] text-mini">
            Enter to send · Shift + Enter for a new line
          </p>
          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="size-10 rounded-full transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md"
            aria-label="Send message"
          >
            {isThinking ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-mini">
        AI can make mistakes. Please verify important information.
      </p>
    </div>
  );
};

const MessageRow = ({ message }: { message: AdminChatMessage }) => {
  const isAssistant = message.role === "ASSISTANT";
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout="position"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant ? (
        <div className="flex w-full items-start gap-3.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-primary shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 max-w-[44rem] pt-0.5">
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-normal">
              {message.content}
            </p>
            {(message.provider || message.model) && (
              <p className="mt-2 text-[10px] uppercase tracking-wide text-mini/75">
                {[message.provider, message.model].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-[82%] rounded-[1.25rem] rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-6 text-normal sm:max-w-[75%]">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      )}
    </motion.div>
  );
};

const PendingUserMessage = ({ message }: { message: PendingMessage }) => (
  <motion.div
    key={message.id}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-end"
  >
    <div className="max-w-[82%] rounded-[1.25rem] rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-6 text-normal sm:max-w-[75%]">
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  </motion.div>
);

const ThinkingRow = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3.5 text-mini"
  >
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-primary shadow-xs">
      <Sparkles className="size-4" />
    </div>
    <div className="flex items-center gap-2 text-xs" aria-label="AI is thinking">
      <span>AI is thinking</span>
      <span className="flex items-center gap-1 pt-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </span>
    </div>
  </motion.div>
);

const Chatbot = () => {
  const user = useAuthUser();
  const [activeRoomId, setActiveRoomId] = useState<string>();
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<PendingMessage>();
  const [showPrivacy, setShowPrivacy] = useState(true);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLockedSidebar();

  const roomsQuery = useAdminChatRooms();
  const messagesQuery = useAdminChatMessages(activeRoomId);
  const catalogQuery = useMyAiProviderCatalog();
  const settingQuery = useMyAiProviderSetting();
  const usageQuery = useMyAdminAiUsage();
  const sendMessageMutation = useSendAdminChatMessage();
  const deleteRoomMutation = useDeleteAdminChatRoom();
  const updateModelMutation = useUpdateMyAiProviderSetting();

  const rooms = roomsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const isThinking = sendMessageMutation.isPending;
  const aiEnabled = settingQuery.data?.enabled ?? true;
  const hasConversation = messages.length > 0 || Boolean(pendingMessage);
  const displayName = user?.firstname || user?.username || "Admin";

  const modelOptions = useMemo(
    () =>
      (catalogQuery.data ?? []).flatMap((provider) =>
        provider.models.map((model) => ({
          provider: provider.provider,
          providerLabel: provider.label,
          available: provider.available,
          model,
        }))
      ),
    [catalogQuery.data]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeRoomId, messages.length, pendingMessage, isThinking]);

  const selectRoom = (roomId: string) => {
    if (isThinking) return;
    setActiveRoomId(roomId);
    setPendingMessage(undefined);
    setInput("");
    setMobileHistoryOpen(false);
  };

  const startNewChat = () => {
    if (isThinking) return;
    setActiveRoomId(undefined);
    setPendingMessage(undefined);
    setInput("");
    setShowPrivacy(true);
    setMobileHistoryOpen(false);
  };

  const deleteRoom = async (roomId: string) => {
    if (deleteRoomMutation.isPending) return;
    setDeletingRoomId(roomId);
    try {
      await deleteRoomMutation.mutateAsync(roomId);
      if (activeRoomId === roomId) startNewChat();
    } catch {
      // The mutation hook already shows the API error; keep the room selected.
    } finally {
      setDeletingRoomId(undefined);
    }
  };

  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isThinking || !aiEnabled) return;

    const pending = { id: createPendingId(), content: text };
    setPendingMessage(pending);
    setInput("");

    try {
      // Omitting `roomId` lets the backend create the room in the same call.
      // Creating it up front would leave an empty room behind whenever the
      // reply fails — an exhausted AI budget, or a provider outage.
      // The model is not sent: the backend reads it from the stored setting.
      const result = await sendMessageMutation.mutateAsync({
        roomId: activeRoomId,
        text,
      });

      if (!activeRoomId) setActiveRoomId(result.roomId);
      setPendingMessage(undefined);
    } catch {
      setPendingMessage(undefined);
      setInput((current) => current || text);
    }
  };

  const sidebarProps = {
    rooms,
    activeId: activeRoomId,
    onSelect: selectRoom,
    onNewChat: startNewChat,
    onDelete: deleteRoom,
    isLoading: roomsQuery.isLoading,
    isError: roomsQuery.isError,
    onRetry: () => roomsQuery.refetch(),
    deletingRoomId,
  };

  const setting = settingQuery.data;
  const selectedModel: ModelSelection | undefined = setting
    ? { provider: setting.provider, model: setting.model }
    : undefined;
  // Publishing the model is a back-office setting change, not a chat option.
  const canChangeModel = setting?.role === "dev" || setting?.role === "owner";
  const selectedModelLabel = setting?.model ?? "Loading model…";
  const usage = usageQuery.data;

  return (
    <div className="-mx-4 flex h-[calc(100svh-4rem)] min-h-[38rem] overflow-hidden md:-mx-6 xl:-mx-10">
      <ChatHistorySidebar {...sidebarProps} />

      <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
        <SheetContent
          side="left"
          className="w-[19rem] gap-0 p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Chat history</SheetTitle>
          <ChatHistorySidebar {...sidebarProps} mobile />
        </SheetContent>
      </Sheet>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background/30 transition-colors duration-300">
        <header className="relative flex h-13 shrink-0 items-center justify-center border-b border-border/40 px-3 sm:px-4">
          <div className="absolute left-2 flex items-center gap-1 lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileHistoryOpen(true)}
              className="size-9 rounded-full"
              aria-label="Open chat history"
            >
              <Menu className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={startNewChat}
              disabled={isThinking}
              className="size-9 rounded-full"
              aria-label="New chat"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {canChangeModel ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={
                    catalogQuery.isLoading ||
                    modelOptions.length === 0 ||
                    updateModelMutation.isPending
                  }
                  className="h-8 max-w-[48vw] gap-1.5 rounded-full border bg-card/75 px-3 text-xs font-medium text-normal shadow-xs backdrop-blur-md sm:max-w-none"
                >
                  {updateModelMutation.isPending ? (
                    <LoaderCircle className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <Sparkles className="size-3.5 text-primary" />
                  )}
                  <span className="truncate">{selectedModelLabel}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-mini" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-72 rounded-xl p-1.5"
              >
                <DropdownMenuLabel className="text-xs font-normal text-mini">
                  เปลี่ยนโมเดลที่ใช้ตอบ — มีผลกับแอดมินทุกคน
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedModel ? modelValue(selectedModel) : ""}
                  onValueChange={(value) => {
                    const selection = parseModelValue(value);
                    if (!selection) return;
                    if (
                      selection.provider === selectedModel?.provider &&
                      selection.model === selectedModel?.model
                    ) {
                      return;
                    }
                    updateModelMutation.mutate(selection);
                  }}
                >
                  {modelOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={`${option.provider}:${option.model}`}
                      value={modelValue(option)}
                      disabled={
                        !option.available ||
                        isThinking ||
                        updateModelMutation.isPending
                      }
                      className="items-start rounded-lg py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-normal">
                          {option.model}
                        </p>
                        <p className="mt-0.5 text-[11px] text-mini">
                          {option.providerLabel}
                          {!option.available ? " · API key unavailable" : ""}
                        </p>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div
              className="flex h-8 max-w-[48vw] items-center gap-1.5 rounded-full border bg-card/75 px-3 text-xs font-medium text-normal shadow-xs backdrop-blur-md sm:max-w-none"
              title="โมเดลตั้งค่าโดย owner หรือ dev"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span className="truncate">{selectedModelLabel}</span>
            </div>
          )}

          {usage && (
            <p className="absolute right-4 hidden text-[11px] text-mini sm:block">
              {usage.usedCredit}
              {usage.limitCredit ? ` / ${usage.limitCredit}` : ""} credits
            </p>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {activeRoomId && messagesQuery.isLoading ? (
            <div className="mx-auto w-full max-w-[820px] space-y-8 px-4 py-12 sm:px-6">
              {["w-2/5 ml-auto", "w-4/5", "w-1/3 ml-auto"].map(
                (className, index) => (
                  <div
                    key={index}
                    className={`h-16 animate-pulse rounded-2xl bg-muted ${className}`}
                  />
                )
              )}
            </div>
          ) : activeRoomId && messagesQuery.isError ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
              <p className="text-sm text-destructive">
                โหลดข้อความในห้องนี้ไม่สำเร็จ
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => messagesQuery.refetch()}
                className="mt-3 gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          ) : !hasConversation ? (
            <motion.div
              key={`empty-${activeRoomId ?? "new"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex min-h-full w-full max-w-[920px] flex-col justify-center px-4 py-8 sm:px-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-normal sm:text-4xl">
                  Hello, {displayName} <span aria-hidden>👋</span>
                </h1>
                <p className="mt-2 text-sm text-mini sm:text-base">
                  How can I help you today?
                </p>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {suggestions.map(({ icon: Icon, title, description, prompt }) => (
                  <button
                    key={title}
                    type="button"
                    disabled={isThinking || !aiEnabled}
                    onClick={() => void sendMessage(prompt)}
                    className="group rounded-2xl border bg-card/70 p-4 text-left shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:bg-card hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Icon className="size-5 text-primary transition-transform duration-200 group-hover:scale-110" />
                    <p className="mt-5 text-sm font-medium text-normal">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-mini">
                      {description}
                    </p>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showPrivacy && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 flex items-start gap-3 rounded-2xl border bg-card/60 p-4 backdrop-blur-sm"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-normal">
                        ประวัติแชทแยกตามบัญชี
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-mini">
                        แอดมินคนอื่นจะไม่เห็นห้องของคุณ ส่วน owner/dev สามารถตรวจสอบเพื่อ audit ได้
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPrivacy(false)}
                      className="size-8 rounded-full"
                      aria-label="Dismiss privacy notice"
                    >
                      <X className="size-4 text-mini" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-6">
              <div className="space-y-10">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <MessageRow key={message.id} message={message} />
                  ))}
                  {pendingMessage && (
                    <PendingUserMessage
                      key={pendingMessage.id}
                      message={pendingMessage}
                    />
                  )}
                  {isThinking && <ThinkingRow key="thinking" />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        <ChatComposer
          value={input}
          disabled={isThinking || !aiEnabled}
          isThinking={isThinking}
          aiEnabled={aiEnabled}
          onChange={setInput}
          onSend={() => void sendMessage()}
        />
      </section>
    </div>
  );
};

export default Chatbot;

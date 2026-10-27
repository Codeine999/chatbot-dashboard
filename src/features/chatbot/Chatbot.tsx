import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthUser } from "@/features/auth/store/auth.store";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import { ChatComposer } from "./components/ChatComposer";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { ChatModelBar } from "./components/ChatModelPicker";
import { MessageRow, PendingUserMessage, ThinkingRow } from "./components/ChatMessages";
import { useChatModel } from "./hooks/useChatModel";
import { useChatSession } from "./hooks/useChatSession";
import { useLockedSidebar } from "./hooks/useLockedSidebar";
import { useChatTitleStore } from "./store/chatTitle.store";

const Chatbot = () => {
  const { t } = useTranslation("chat");
  const user = useAuthUser();
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  useLockedSidebar();

  const model = useChatModel();
  const chat = useChatSession(model.aiEnabled);
  const { messagesQuery, roomsQuery } = chat;

  const displayName = user?.firstname || user?.username || t("defaultName");

  // ชื่อห้องไปโชว์มุมซ้ายของ Navbar ออกจากหน้าแล้วล้างทิ้ง กันชื่อค้างไปหน้าอื่น
  const setChatTitle = useChatTitleStore((state) => state.setTitle);
  const activeTitle = chat.activeRoom?.title ?? null;
  useEffect(() => setChatTitle(activeTitle), [activeTitle, setChatTitle]);
  useEffect(() => () => setChatTitle(null), [setChatTitle]);

  const selectRoom = (roomId: string) => {
    chat.selectRoom(roomId);
    setMobileHistoryOpen(false);
  };

  const startNewChat = () => {
    chat.startNewChat();
    setMobileHistoryOpen(false);
  };

  const sidebarProps = {
    rooms: chat.rooms,
    activeId: chat.activeRoomId,
    onSelect: selectRoom,
    onNewChat: startNewChat,
    onDelete: chat.deleteRoom,
    isLoading: roomsQuery.isLoading,
    isError: roomsQuery.isError,
    onRetry: () => roomsQuery.refetch(),
    deletingRoomId: chat.deletingRoomId,
  };

  const composer = (
    <div className="w-full">
      <ChatComposer
        value={chat.input}
        disabled={chat.isThinking || !model.aiEnabled}
        isThinking={chat.isThinking}
        aiEnabled={model.aiEnabled}
        onChange={chat.setInput}
        onSend={() => void chat.sendMessage()}
      />
      <ChatModelBar model={model} isThinking={chat.isThinking} />
    </div>
  );

  const renderBody = () => {
    if (chat.activeRoomId && messagesQuery.isLoading) {
      return (
        <div className="mx-auto w-full max-w-[900px] space-y-8 px-4 py-12 sm:px-6">
          {["w-2/5 ml-auto", "w-4/5", "w-1/3 ml-auto"].map((className, index) => (
            <div
              key={index}
              className={`h-16 animate-pulse rounded-2xl bg-muted ${className}`}
            />
          ))}
        </div>
      );
    }

    if (chat.activeRoomId && messagesQuery.isError) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-destructive">{t("messages.loadError")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => messagesQuery.refetch()}
            className="mt-3 gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            {t("messages.retry")}
          </Button>
        </div>
      );
    }

    if (!chat.hasConversation) {
      return (
        <motion.div
          key={`empty-${chat.activeRoomId ?? "new"}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-full"
        >
          <ChatEmptyState displayName={displayName}>
            {composer}
          </ChatEmptyState>
        </motion.div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
        <div className="space-y-10">
          <AnimatePresence initial={false}>
            {chat.messages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
            {chat.pendingMessage && (
              <PendingUserMessage key={chat.pendingMessage.id} message={chat.pendingMessage} />
            )}
            {chat.isThinking && <ThinkingRow key="thinking" />}
          </AnimatePresence>
          <div ref={chat.messagesEndRef} />
        </div>
      </div>
    );
  };

  return (
    <div className="-mx-4 flex h-[calc(100svh-4rem)] min-h-[38rem] overflow-hidden md:-mx-6 xl:-mx-10">
      <ChatHistorySidebar {...sidebarProps} />

      <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
        <SheetContent side="left" className="w-[19rem] gap-0 p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">{t("header.history")}</SheetTitle>
          <ChatHistorySidebar {...sidebarProps} mobile />
        </SheetContent>
      </Sheet>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 sm:px-6 lg:hidden">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileHistoryOpen(true)}
              className="size-9 rounded-full"
              aria-label={t("header.openHistory")}
            >
              <Menu className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={startNewChat}
              disabled={chat.isThinking}
              className="size-9 rounded-full"
              aria-label={t("header.newChat")}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{renderBody()}</div>

        {chat.hasConversation && (
          <div className="mx-auto w-full max-w-[900px] px-4 pb-3 pt-2 sm:px-6">
            {composer}
            <p className="mt-1 text-center text-[11px] text-mini">{t("composer.disclaimer")}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Chatbot;

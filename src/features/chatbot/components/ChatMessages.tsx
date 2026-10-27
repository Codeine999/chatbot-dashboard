import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";
import type { AdminChatMessage } from "../type";
import { formatTime, type PendingMessage } from "../lib/chatFormat";

const CopyButton = ({ text }: { text: string }) => {
  const { t } = useTranslation("chat");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be blocked; nothing to recover
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={t("messages.copy")}
      className="rounded-lg p-1.5 text-mini transition hover:bg-hover hover:text-normal"
    >
      {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
    </button>
  );
};

const UserBubble = ({ content, createdAt }: { content: string; createdAt?: string }) => (
  <div className="flex max-w-[82%] flex-col items-end sm:max-w-[75%]">
    <div className="rounded-2xl bg-hover px-5 py-3.5 text-[15px] leading-7 text-normal">
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
    <p className="mt-1.5 text-xs text-mini">{formatTime(createdAt)}</p>
  </div>
);

const AssistantAvatar = () => (
  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
    <Sparkles className="size-4" />
  </div>
);

export const MessageRow = ({ message }: { message: AdminChatMessage }) => {
  const { t } = useTranslation("chat");
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
          <AssistantAvatar />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-normal">
                {t("messages.assistant")}
              </span>
              <span className="text-xs text-mini">{formatTime(message.createdAt)}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-normal">
              {message.content}
            </p>
            <div className="mt-2 -ml-1.5">
              <CopyButton text={message.content} />
            </div>
          </div>
        </div>
      ) : (
        <UserBubble content={message.content} createdAt={message.createdAt} />
      )}
    </motion.div>
  );
};

export const PendingUserMessage = ({ message }: { message: PendingMessage }) => (
  <motion.div
    key={message.id}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-end"
  >
    <UserBubble content={message.content} />
  </motion.div>
);

export const ThinkingRow = () => {
  const { t } = useTranslation("chat");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3.5 text-mini"
    >
      <AssistantAvatar />
      <div className="flex items-center gap-2 text-xs" aria-label={t("thinking")}>
        <span>{t("thinking")}</span>
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
};

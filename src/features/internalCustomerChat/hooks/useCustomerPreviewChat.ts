import i18n from "@/i18n";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/api";
import { userviewApi } from "../services/userview.service";
import type { FailedPreviewSend, PreviewMessage } from "../type";

const SESSION_KEY = "internal-customer-chat:session";

export const previewKeys = {
  session: (sessionId?: string) => ["userview", "session", sessionId] as const,
};

const readStoredSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

const storeSession = (sessionId?: string) => {
  try {
    if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage ถูกบล็อก ก็แค่ refresh แล้วได้ session ใหม่
  }
};

const statusOf = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

const newId = () => crypto.randomUUID();

/**
 * session ทดสอบแชทลูกค้า + รายการข้อความบนหน้าจอ
 * - session ผูกกับแอดมินที่ล็อกอินและหมดอายุเมื่อไม่ใช้ 30 นาที เก็บ id ไว้ใน sessionStorage เผื่อ refresh
 * - ส่งทีละข้อความ ปุ่มส่งต้องถูกปิดระหว่างรอ (isSending)
 */
export function useCustomerPreviewChat() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string>();
  const [isStarting, setIsStarting] = useState(true);
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [failedSend, setFailedSend] = useState<FailedPreviewSend>();
  const [aiDisabled, setAiDisabled] = useState(false);
  const busyRef = useRef(false);
  const startedRef = useRef(false);

  const pushNotice = (text: string, tone: "muted" | "warning" = "muted") =>
    setMessages((current) => [...current, { id: newId(), kind: "notice", tone, text }]);

  const createSession = useCallback(async () => {
    setIsStarting(true);
    setError("");
    try {
      const session = await userviewApi.createSession();
      storeSession(session.sessionId);
      setSessionId(session.sessionId);
      return session.sessionId;
    } catch (failure) {
      storeSession(undefined);
      setSessionId(undefined);
      setAiDisabled(statusOf(failure) === 403);
      setError(getApiErrorMessage(failure, i18n.t("chat:customerTest.startError")));
      return undefined;
    } finally {
      setIsStarting(false);
    }
  }, []);

  // เปิดหน้า: ใช้ session เดิมถ้ายังอยู่ ไม่งั้นสร้างใหม่
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const stored = readStoredSession();
    if (!stored) {
      void createSession();
      return;
    }

    userviewApi
      .getSession(stored)
      .then((state) => {
        setSessionId(state.sessionId);
        setIsStarting(false);
      })
      .catch(() => void createSession());
  }, [createSession]);

  const send = async (text: string, retry?: FailedPreviewSend) => {
    const value = text.trim();
    if (!value || !sessionId || busyRef.current) return false;

    // retry ใช้ clientRequestId เดิม backend จะคืนคำตอบเดิมโดยไม่ตัดเครดิตซ้ำ
    const clientRequestId = retry?.clientRequestId ?? newId();
    busyRef.current = true;
    setIsSending(true);
    setError("");
    setFailedSend(undefined);
    if (!retry) {
      setMessages((current) => [...current, { id: newId(), kind: "customer", text: value }]);
    }

    try {
      const reply = await userviewApi.sendMessage(sessionId, { clientRequestId, text: value });

      setMessages((current) => [
        ...current,
        reply.text.trim()
          ? { id: newId(), kind: "bot", text: reply.text, source: reply.source }
          : {
              id: newId(),
              kind: "notice",
              tone: "warning",
              text: i18n.t("chat:customerTest.noReply"),
            },
        ...(reply.contextPolicy === "CLEAR"
          ? [
              {
                id: newId(),
                kind: "notice" as const,
                tone: "muted" as const,
                text: i18n.t("chat:customerTest.newTopic"),
              },
            ]
          : []),
      ]);
      void queryClient.invalidateQueries({ queryKey: previewKeys.session(sessionId) });
      return true;
    } catch (failure) {
      const status = statusOf(failure);

      if (status === 404) {
        // session หมดอายุหรือถูกลบ เริ่มใหม่ให้อัตโนมัติ
        storeSession(undefined);
        setMessages([]);
        const created = await createSession();
        if (created) pushNotice(i18n.t("chat:customerTest.sessionExpired"), "warning");
      } else {
        if (status === 403) setAiDisabled(true);
        // 400/401/403 ส่งซ้ำก็ไม่หาย เก็บไว้ retry เฉพาะ network/500
        if (!status || status >= 500) setFailedSend({ clientRequestId, text: value });
        setError(getApiErrorMessage(failure, i18n.t("chat:customerTest.sendError")));
      }
      return false;
    } finally {
      busyRef.current = false;
      setIsSending(false);
    }
  };

  const restart = async () => {
    if (busyRef.current) return;
    const previous = sessionId;
    setMessages([]);
    setFailedSend(undefined);
    setAiDisabled(false);
    storeSession(undefined);
    setSessionId(undefined);
    // เรียกซ้ำกับ session ที่หมดอายุได้ 200 เสมอ แต่กันเครือข่ายล้มไว้ด้วย
    if (previous) await userviewApi.deleteSession(previous).catch(() => undefined);
    await createSession();
  };

  return {
    sessionId,
    isStarting,
    isSending,
    messages,
    error,
    failedSend,
    aiDisabled,
    send,
    restart,
  };
}

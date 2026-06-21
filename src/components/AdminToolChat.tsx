import { useEffect, useRef, useState } from "react";
import { Bot, Database, Send, Sparkles, UserSearch, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AdminToolMessage = {
  id: string;
  role: "admin" | "ai";
  content: string;
};

const initialMessages: AdminToolMessage[] = [
  {
    id: "welcome",
    role: "ai",
    content:
      "สวัสดีครับ ผมคือ Admin AI Tool ใช้ช่วย query ข้อมูลในระบบได้ เช่น ดึงข้อมูล user, ตรวจสอบเครดิต, หรือสรุปสถานะ LINE OA",
  },
];

const quickPrompts = [
  "ดึงข้อมูลของ user mb30997984",
  "สรุป usage LINE OA วันนี้",
  "เช็คสถานะรายการแจ้งโอนล่าสุด",
];

function getMockAiResponse(input: string) {
  const keyword = input.toLowerCase();

  if (keyword.includes("user") || keyword.includes("ลูกค้า") || keyword.includes("mb")) {
    return [
      "พบข้อมูลตัวอย่างของผู้ใช้:",
      "Username: mb30997984",
      "Name: เพชรอันดา ปักษา",
      "Register status: pending",
      "Transfer status: pending",
      "หมายเหตุ: ข้อมูลนี้เป็น mock response ยังไม่ได้เชื่อม API จริง",
    ].join("\n");
  }

  if (keyword.includes("usage") || keyword.includes("credit") || keyword.includes("เครดิต")) {
    return [
      "สรุป usage ตัวอย่าง:",
      "LINE_MESSAGE usedTotal: 225",
      "LINE_MESSAGE balance: 3000",
      "AI credit used: 332 / 1000",
      "หมายเหตุ: ยังเป็น mock response สำหรับ UI เท่านั้น",
    ].join("\n");
  }

  if (keyword.includes("โอน") || keyword.includes("transfer")) {
    return [
      "รายการแจ้งโอนล่าสุด:",
      "ลูกค้า: เพชรอันดา",
      "สถานะ: pending",
      "Action: รอแอดมินตรวจสอบสลิป",
    ].join("\n");
  }

  return "รับคำสั่งแล้วครับ ตอนนี้เป็น mock AI tool ยังไม่ได้เชื่อม API จริง แต่ UI พร้อมสำหรับต่อ query ข้อมูลระบบในขั้นถัดไป";
}

export function AdminToolChat() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AdminToolMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (isHome) return null;

  const sendMessage = (value = input) => {
    const text = value.trim();
    if (!text || isTyping) return;

    const adminMessage: AdminToolMessage = {
      id: `admin-${Date.now()}`,
      role: "admin",
      content: text,
    };

    setMessages((current) => [...current, adminMessage]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const aiMessage: AdminToolMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: getMockAiResponse(text),
      };

      setMessages((current) => [...current, aiMessage]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        aria-hidden={!isOpen}
        className={`mb-4 flex h-[560px] w-[380px] max-w-[calc(100vw-3rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">Admin AI Tool</p>
                <p className="text-xs text-slate-500">Query dashboard data</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-4">
            {messages.map((message) => {
              const isAdmin = message.role === "admin";

              return (
                <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[86%] gap-2 ${isAdmin ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        isAdmin ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {isAdmin ? <UserSearch className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isAdmin
                          ? "rounded-br-md bg-slate-900 text-white"
                          : "rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-full bg-white px-3 py-2 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200">
                  AI is querying mock data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask admin AI to query data..."
                className="max-h-28 min-h-16 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-xs text-slate-500">Enter to send</p>
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="h-9 rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl ring-1 ring-slate-800 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-800 ${
          isOpen ? "rotate-90 scale-95" : "rotate-0 scale-100"
        }`}
        aria-label="Open admin AI tool"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Database className="h-6 w-6" />}
      </button>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { Button } from '../../components/ui/button'
import {
    Expand,
    ArrowUp,

} from "lucide-react";
import { motion } from "framer-motion";

import { IAiChatbot } from "./type";
import { getAiChatbot } from "./services/aiChatbotApi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import UserAvatar from "@/components/common/UserAvatar";

const Chatbot = () => {
    const { t } = useTranslation("home");
    const [messages, setMessages] = useState<IAiChatbot[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const idRef = useRef(1);
    const scrollRef = useRef<HTMLDivElement>(null);


    // scroll ลงล่างอัตโนมัติ เมื่อ messages เปลี่ยน
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);


    // ตั้งข้อความทักทายครั้งเดียวตอน mount
    // อ่านจาก i18n ตรง ๆ ไม่ใช้ t จาก hook จะได้ไม่ต้องใส่ใน deps
    // ไม่งั้นพอสลับภาษา effect จะรันใหม่แล้วล้างบทสนทนาที่คุยไว้ทิ้ง
    useEffect(() => {
        setIsLoading(true);

        const timeout = setTimeout(() => {
            setMessages([
                {
                    id: idRef.current++,
                    role: "ai",
                    content: i18n.t("home:chatbot.greeting"),
                },
            ]);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timeout);
    }, []);



    const addMessage = (msg: Omit<IAiChatbot, "id">) => {
        setMessages((prev) => {
            const newMsg = { id: idRef.current++, ...msg };
            const updated = [...prev, newMsg];
            // ตัดข้อความเกิน 3 ข้อความล่าสุด
            return updated.length > 5 ? updated.slice(updated.length - 3) : updated;
        });
    };

    const handleSend = async () => {

        if (!input.trim() || isLoading) return;

        addMessage({ role: "user", content: input });
        setInput("");
        setIsLoading(true);

        try {
            const response = await getAiChatbot(input);
            console.log("API response:", response);

            if (!response || !response.reply) {
                throw new Error("ไม่มีข้อมูลจาก API");
            }

            const replyObj = response.reply;

            const replyText = replyObj.parts
                ? replyObj.parts.map((p: { text: string }) => p.text).join(' ')
                : replyObj.text || t("chatbot.noContent");

            addMessage({ role: "ai", content: replyText });

        } catch (error) {
            addMessage({ role: "ai", content: t("chatbot.error") });
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex flex-col gap-3 rounded-[18px] border bg-background p-3 pl-[18px] shadow-[rgba(0,0,0,0.04)_0px_4px_14px]">
            {/* ข้อความบนสุดอยู่ในกรอบเดียวกับช่องพิมพ์ เลื่อนได้เมื่อยาว */}
            <div ref={scrollRef} className="flex max-h-[260px] min-h-[120px] flex-1 flex-col space-y-3 overflow-y-auto pr-3 pt-1">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className="flex max-w-[80%] items-start gap-2">
                            <div
                                className={`rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-gray-700 text-white"
                                    : "bg-muted text-foreground"}
                                `}
                            >
                                {msg.content}
                            </div>
                            {msg.role === "user" && <UserAvatar className="size-7 shrink-0" />}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start text-sm text-muted-foreground">
                        {t("chatbot.typing")}
                    </div>
                )}
            </div>

            <label htmlFor="home-ask" className="sr-only">{t("chatbot.title")}</label>
            <input
                id="home-ask"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                placeholder={t("chatbot.inputPlaceholder")}
                className="h-11 w-full bg-transparent pr-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />

            <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
                    <img src="./icon/gemini.webp" alt="" className="size-4 shrink-0 rounded-full" />
                    <span className="truncate">{t("chatbot.title")} · {t("chatbot.model")}</span>
                </span>
                <div className="flex items-center gap-1.5">
                    <Link to="/ai-chatbot" aria-label={t("chatbot.title")}>
                        <Button variant="ghost" size="icon" className="size-10 rounded-[10px] text-muted-foreground">
                            <Expand className="size-[15px]" />
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSend}
                        disabled={isLoading}
                        variant="ghost"
                        className="!size-10 shrink-0 rounded-full bg-black text-white hover:bg-[#1a1a1a] dark:bg-white dark:text-black dark:hover:bg-white/85"
                    >
                        <ArrowUp className="size-4" strokeWidth={2.2} />
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Chatbot

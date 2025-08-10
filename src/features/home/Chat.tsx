import React, { useState, useRef, useEffect } from "react";
import { Button } from '../../components/ui/button'
import {
    CardContent,
    CardTitle,
    CardDescription,
    CardHeader,
    Card,
} from "@/components/ui/card"

import {
    Expand,
    Ellipsis,
    ArrowUp,

} from "lucide-react";
import { motion } from "framer-motion";

import { IAiChatbot } from "./type";
import { getAiChatbot } from "./services/aiChatbotApi";
import { Link } from "react-router-dom";

const Chatbot = () => {

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


    useEffect(() => {
        setIsLoading(true);

        const timeout = setTimeout(() => {
            setMessages([
                {
                    id: idRef.current++,
                    role: "ai",
                    content: "สวัสดีครับ มีอะไรให้ช่วยมั้ย :)",
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
                : replyObj.text || 'ไม่มีข้อความ';

            addMessage({ role: "ai", content: replyText });

        } catch (error) {
            addMessage({ role: "ai", content: "เกิดข้อผิดพลาดในการติดต่อ API" });
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex justify-between p-6 items-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <img
                            src="./icon/gemini.webp"
                            className="w-8 h-8 bg-gray-300 rounded-full"
                        />
                        <div>
                            <CardTitle>Ai Chat Bot</CardTitle>
                            <CardDescription>model from Gemini</CardDescription>
                        </div>
                    </div>
                </div>
                <Link to="/ai-chatbot">
                    <Button variant="ghost">
                        <Expand />
                    </Button>
                </Link>
            </div>


            <div ref={scrollRef} className="p-6 flex flex-col space-y-3 h-[190px] overflow-y-auto">

                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`p-2.5 text-sm rounded-lg max-w-[70%] ${msg.role === "user" ? "bg-gray-700 text-white"
                                : "bg-gray-100"}
                            `}
                        >
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start text-gray-500 text-sm">
                        AI is typing...
                    </div>
                )}
            </div>

            <div className="p-4 py-6 flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                    placeholder="Type your message..."
                    className="w-full h-10 p-4 rounded-lg border focus:outline-none placeholder:text-sm"
                />
                <Button
                    onClick={handleSend}
                    disabled={isLoading}
                    variant="ghost"
                    className="ml-2 !w-10 !h-10 border-1 rounded-full text-white bg-gray-600
             hover:bg-gray-700"
                >
                    <ArrowUp />
                </Button>
            </div>
        </Card>
    )
}

export default Chatbot
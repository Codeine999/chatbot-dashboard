import type { AiSettingForm } from "../type";

/** ค่าเริ่มต้นของฟอร์ม ใช้ไปก่อนจนกว่าจะต่อ GET /api/admin/ai-settings */
export const aiSettingMock: AiSettingForm = {
  ownerPrompt:
    "You are representing our hotel brand. Focus on providing helpful, accurate, and professional information.",
  tone: "Friendly",
  skills: [
    { name: "Room booking", prompt: "Help customers check room availability and make a booking." },
    { name: "Facilities", prompt: "Answer questions about hotel facilities and opening hours." },
    { name: "Location", prompt: "Give directions and nearby landmarks for the hotel." },
  ],
  responseStyle: { targetLength: "short", emojiLevel: "light" },
  fallbackMessage:
    "I'm sorry, I couldn't find the information you're looking for. Please contact our staff for further assistance.",
};

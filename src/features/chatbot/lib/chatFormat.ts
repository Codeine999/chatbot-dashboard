import type { AiProviderName } from "../type";

export type ModelSelection = {
  provider: AiProviderName;
  model: string;
};

export type PendingMessage = {
  id: string;
  content: string;
};

export const formatTime = (value?: string) =>
  new Date(value ?? Date.now()).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const createPendingId = () =>
  `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const modelValue = (selection: ModelSelection) =>
  `${selection.provider}::${selection.model}`;

export const parseModelValue = (value: string): ModelSelection | undefined => {
  const separator = value.indexOf("::");
  if (separator < 1) return undefined;

  return {
    provider: value.slice(0, separator) as AiProviderName,
    model: value.slice(separator + 2),
  };
};

export const CHAT_TITLE_MAX_LENGTH = 10;

// สระบน/ล่างและวรรณยุกต์ไทยที่ซ้อนอยู่บนตัวอักษรก่อนหน้า ไม่นับเป็นตัวอักษรแยก
const THAI_COMBINING = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;

/**
 * ตัดชื่อห้องให้ไม่เกิน max ตัวอักษร เกินแล้วต่อ "..."
 * นับตามตัวอักษรที่ตามองเห็น ไม่นับสระ/วรรณยุกต์ที่ซ้อนอยู่ จึงไม่ตัดกลางคำจนเหลือสระลอย
 */
export const truncateTitle = (title: string, max = CHAT_TITLE_MAX_LENGTH) => {
  let visible = 0;
  let end = 0;
  const chars = Array.from(title);

  for (let index = 0; index < chars.length; index += 1) {
    if (!THAI_COMBINING.test(chars[index])) {
      if (visible === max) return `${chars.slice(0, end).join("")}...`;
      visible += 1;
    }
    end = index + 1;
  }

  return title;
};

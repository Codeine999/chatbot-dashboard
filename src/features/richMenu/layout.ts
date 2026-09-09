import type {
  RichMenu,
  RichMenuArea,
  RichMenuTemplateId,
} from "./type";

/** ขนาดภาพ rich menu แบบใหญ่ของ LINE — bounds ทุกตัวอ้างอิงพิกัดบนภาพขนาดนี้ */
export const RICH_MENU_CANVAS = { width: 2500, height: 1686 } as const;

export const RICH_MENU_MAX_IMAGE_MB = 1;
export const RICH_MENU_IMAGE_TYPES = ["image/png", "image/jpeg"];

/** ความยาวสูงสุดตามสเปกของ LINE ใช้โชว์ตัวนับใต้ช่องกรอก */
export const POSTBACK_DATA_MAX = 300;
export const DISPLAY_TEXT_MAX = 100;
export const CHAT_BAR_TEXT_MAX = 14;

export const RICH_MENU_TEMPLATES: readonly {
  id: RichMenuTemplateId;
  cols: number;
  rows: number;
}[] = [
  { id: "grid6", cols: 3, rows: 2 },
  { id: "grid3", cols: 3, rows: 1 },
  { id: "split2", cols: 2, rows: 1 },
  { id: "single", cols: 1, rows: 1 },
];

export const getTemplate = (id: RichMenuTemplateId) =>
  RICH_MENU_TEMPLATES.find((template) => template.id === id) ??
  RICH_MENU_TEMPLATES[0];

export const createId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

/** ขอบของช่องที่ index จากทั้งหมด count ช่อง
 *  ปัดทีละขอบแทนการปัดความกว้าง ผลรวมจึงเท่ากับความกว้างภาพเป๊ะ ไม่เหลือเศษค้างขอบขวา */
const edgeAt = (index: number, count: number, total: number) =>
  Math.round((total * index) / count);

export const buildTemplateAreas = (
  templateId: RichMenuTemplateId,
  labelAt: (index: number) => string
): RichMenuArea[] => {
  const { cols, rows } = getTemplate(templateId);
  const areas: RichMenuArea[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = edgeAt(col, cols, RICH_MENU_CANVAS.width);
      const y = edgeAt(row, rows, RICH_MENU_CANVAS.height);

      areas.push({
        id: createId("area"),
        label: labelAt(areas.length + 1),
        bounds: {
          x,
          y,
          width: edgeAt(col + 1, cols, RICH_MENU_CANVAS.width) - x,
          height: edgeAt(row + 1, rows, RICH_MENU_CANVAS.height) - y,
        },
        action: { type: "postback", data: "", text: "", uri: "", showInChat: false },
      });
    }
  }

  return areas;
};

/**
 * อัตราส่วนแบบอ่านออก เช่น 1:1 หรือ 3:2
 *
 * หา ห.ร.ม. ตรง ๆ ไม่ได้ เพราะช่องจริงมักเป็น 833×843 แล้วจะได้ "833:843"
 * จึงไล่หาเศษส่วนที่ตัวเลขไม่เกิน 12 ซึ่งใกล้ค่าจริงที่สุดแทน
 */
export const formatAspectRatio = (width: number, height: number) => {
  if (!width || !height) return "—";

  const ratio = width / height;
  let best = { w: 1, h: 1, diff: Number.POSITIVE_INFINITY };

  for (let h = 1; h <= 12; h += 1) {
    for (let w = 1; w <= 12; w += 1) {
      const diff = Math.abs(w / h - ratio);
      if (diff < best.diff - 1e-9) best = { w, h, diff };
    }
  }

  return `${best.w}:${best.h}`;
};

/** key ของข้อความเตือนใน namespace "richMenu" หรือ null ถ้าพื้นที่นี้กรอกครบแล้ว */
export const getAreaIssueKey = (area: RichMenuArea): string | null => {
  const { type, data, text, uri } = area.action;

  if (type === "postback" && !data.trim()) return "issue.data";
  if (type === "message" && !text.trim()) return "issue.text";
  if (type === "uri") {
    if (!uri.trim()) return "issue.uri";
    if (!/^https?:\/\//i.test(uri.trim())) return "issue.uriFormat";
  }

  return null;
};

export const getMenuIssues = (menu: RichMenu) =>
  (menu?.areas ?? [])
    .map((area) => ({ area, issueKey: getAreaIssueKey(area) }))
    .filter((item) => item.issueKey);

export const PUBLISH_STEPS = ["validate", "create", "upload", "default"];

/** แปลงพิกัด px บนภาพเต็มเป็น % เพื่อวางทับตัวอย่างที่ย่อขนาดแล้ว */
export const boundsToPercent = (bounds: RichMenuArea["bounds"]) => ({
  left: `${(bounds.x / RICH_MENU_CANVAS.width) * 100}%`,
  top: `${(bounds.y / RICH_MENU_CANVAS.height) * 100}%`,
  width: `${(bounds.width / RICH_MENU_CANVAS.width) * 100}%`,
  height: `${(bounds.height / RICH_MENU_CANVAS.height) * 100}%`,
});

export const CANVAS_ASPECT_RATIO = `${RICH_MENU_CANVAS.width} / ${RICH_MENU_CANVAS.height}`;

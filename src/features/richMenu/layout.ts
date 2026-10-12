import type { RichMenu, RichMenuArea, RichMenuButton } from "./type";

/** ขนาดภาพ rich menu แบบใหญ่ของ LINE — bounds ทุกตัวอ้างอิงพิกัดบนภาพขนาดนี้ */
export const RICH_MENU_CANVAS = { width: 2500, height: 1686 } as const;

export const RICH_MENU_MAX_IMAGE_MB = 1;
export const RICH_MENU_IMAGE_TYPES = ["image/png", "image/jpeg"];

/** ความยาวสูงสุดตามสเปกของ LINE ใช้โชว์ตัวนับใต้ช่องกรอก */
export const CHAT_BAR_TEXT_MAX = 14;
export const REPLY_LABEL_MAX = 100;
export const REPLY_TEXT_MAX = 5000;
export const REPLY_KEY_MAX = 64;

/**
 * จำนวนช่องที่เลือกได้ ต้องตรงกับ RICH_MENU_CELL_LAYOUTS ฝั่ง backend เป๊ะ ๆ
 * เพราะ backend เป็นคนคำนวณ bounds จริงตอนบันทึก หน้าจอแค่แสดงผังเดียวกัน
 */
export const RICH_MENU_LAYOUTS: readonly {
  cells: number;
  columns: number;
  rows: number;
}[] = [
  { cells: 6, columns: 3, rows: 2 },
  { cells: 4, columns: 2, rows: 2 },
  { cells: 3, columns: 3, rows: 1 },
  { cells: 2, columns: 2, rows: 1 },
  { cells: 1, columns: 1, rows: 1 },
];

export const getLayout = (cells: number) =>
  RICH_MENU_LAYOUTS.find((layout) => layout.cells === cells) ??
  RICH_MENU_LAYOUTS[0];

export const REPLY_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/** ตั้ง key ให้อัตโนมัติจากข้อความบนปุ่ม เพื่อให้ร้านไม่ต้องคิดเอง */
export const suggestReplyKey = (label: string): string => {
  const ascii = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, REPLY_KEY_MAX);

  // ป้ายภาษาไทยจะเหลือว่าง จึงต้องมีค่าตั้งต้นที่ยังผ่าน pattern ของ backend
  return ascii || `menu_${Date.now().toString(36)}`;
};

/** ขอบของช่องที่ index จากทั้งหมด count ช่อง
 *  ปัดทีละขอบแทนการปัดความกว้าง ผลรวมจึงเท่ากับความกว้างภาพเป๊ะ ไม่เหลือเศษค้างขอบขวา
 *  สูตรเดียวกับ RichMenuImageService.cellRects ฝั่ง backend */
const edgeAt = (index: number, count: number, total: number) =>
  Math.round((total * index) / count);

export const cellBounds = (
  index: number,
  cells: number,
  width = RICH_MENU_CANVAS.width,
  height = RICH_MENU_CANVAS.height
) => {
  const { columns, rows } = getLayout(cells);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = edgeAt(column, columns, width);
  const y = edgeAt(row, rows, height);

  return {
    x,
    y,
    width: edgeAt(column + 1, columns, width) - x,
    height: edgeAt(row + 1, rows, height) - y,
  };
};

/** อัตราส่วนแบบอ่านออก เช่น 1:1 หรือ 3:2 */
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

/** key ของข้อความเตือนใน namespace "richMenu" หรือ null ถ้าช่องนี้พร้อมแล้ว */
export const getCellIssueKey = (
  button: RichMenuButton,
  hasImage: boolean
): string | null => {
  if (button.kind === "uri" && !button.uri.trim()) return "issue.uri";
  if (button.kind === "uri" && !/^https?:\/\//i.test(button.uri.trim())) {
    return "issue.uriFormat";
  }
  if (
    button.kind === "action" &&
    button.action.type === "message" &&
    (typeof button.action.text !== "string" || !button.action.text.trim())
  ) {
    return "issue.message";
  }
  if (
    button.kind === "action" &&
    button.action.type === "postback" &&
    typeof button.action.data === "string" &&
    button.action.data.startsWith("intent=") &&
    (typeof button.action.displayText !== "string" ||
      !button.action.displayText.trim())
  ) {
    return "issue.displayText";
  }
  if (button.kind === "none" && !hasImage) return "issue.emptyCell";

  return null;
};

/** ปัญหาที่ต้องแก้ก่อนเผยแพร่ — LINE ต้องมีภาพ และต้องกดได้อย่างน้อยหนึ่งช่อง */
export const getMenuIssues = (menu: RichMenu | undefined) => {
  if (!menu) return [];

  const issues: { index: number; issueKey: string }[] = [];

  menu.cellList.forEach((cell) => {
    const issueKey = getCellIssueKey(cell.button, Boolean(cell.image));
    if (issueKey) issues.push({ index: cell.index, issueKey });
  });

  if (!menu.image) issues.push({ index: -1, issueKey: "issue.noImage" });

  if (!menu.cellList.some((cell) => cell.button.kind !== "none")) {
    issues.push({ index: -1, issueKey: "issue.noButton" });
  }

  return issues;
};

export const PUBLISH_STEPS = ["validate", "create", "upload", "default"];

/** แปลงพิกัด px บนภาพเต็มเป็น % เพื่อวางทับตัวอย่างที่ย่อขนาดแล้ว */
export const boundsToPercent = (bounds: RichMenuArea["bounds"]) => ({
  left: `${(bounds.x / RICH_MENU_CANVAS.width) * 100}%`,
  top: `${(bounds.y / RICH_MENU_CANVAS.height) * 100}%`,
  width: `${(bounds.width / RICH_MENU_CANVAS.width) * 100}%`,
  height: `${(bounds.height / RICH_MENU_CANVAS.height) * 100}%`,
});

export const CANVAS_ASPECT_RATIO = `${RICH_MENU_CANVAS.width} / ${RICH_MENU_CANVAS.height}`;

import { RICH_MENU_CANVAS } from "../layout";
import type { RichMenu, RichMenuArea } from "../type";

/** ข้อความบนปุ่มเป็นเนื้อหาที่ร้านค้าเขียนเอง ไม่ใช่ข้อความ UI จึงไม่ผ่าน i18n */
type SeedArea = {
  label: string;
  action: Partial<RichMenuArea["action"]> & { type: RichMenuArea["action"]["type"] };
};

const edgeAt = (index: number, count: number, total: number) =>
  Math.round((total * index) / count);

const gridBounds = (index: number, cols: number, rows: number) => {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = edgeAt(col, cols, RICH_MENU_CANVAS.width);
  const y = edgeAt(row, rows, RICH_MENU_CANVAS.height);

  return {
    x,
    y,
    width: edgeAt(col + 1, cols, RICH_MENU_CANVAS.width) - x,
    height: edgeAt(row + 1, rows, RICH_MENU_CANVAS.height) - y,
  };
};

const toAreas = (seeds: SeedArea[], cols: number, rows: number): RichMenuArea[] =>
  seeds.map((seed, index) => ({
    id: `area-seed-${cols}x${rows}-${index}`,
    label: seed.label,
    bounds: gridBounds(index, cols, rows),
    action: {
      data: "",
      text: "",
      uri: "",
      showInChat: false,
      ...seed.action,
    },
  }));

export const richMenusMock: RichMenu[] = [
  {
    id: "menu-main",
    name: "เมนูหลัก",
    source: "line",
    active: true,
    lineId: "richmenu-a82f19c4d7b3e6015f9c",
    template: "grid6",
    chatBarText: "เมนู",
    updatedAt: "2026-08-28T14:30:00.000Z",
    areas: toAreas(
      [
        {
          label: "สินค้า",
          action: { type: "postback", data: "action=catalog", text: "ดูสินค้าทั้งหมด", showInChat: true },
        },
        {
          label: "โปรโมชั่น",
          action: { type: "postback", data: "action=promotion", text: "ดูโปรโมชั่น", showInChat: true },
        },
        {
          label: "ติดตามคำสั่งซื้อ",
          action: { type: "postback", data: "action=track_order", text: "ติดตามคำสั่งซื้อ", showInChat: true },
        },
        {
          label: "คำถามที่พบบ่อย",
          action: { type: "message", text: "คำถามที่พบบ่อย" },
        },
        {
          label: "ติดต่อแอดมิน",
          action: { type: "postback", data: "action=contact_admin", text: "ต้องการติดต่อแอดมิน", showInChat: true },
        },
        {
          label: "เว็บไซต์",
          action: { type: "uri", uri: "https://example.com" },
        },
      ],
      3,
      2
    ),
  },
  {
    id: "menu-promotion",
    name: "เมนูโปรโมชั่น",
    source: "draft",
    active: false,
    template: "grid3",
    chatBarText: "โปรโมชั่น",
    updatedAt: "2026-09-05T09:12:00.000Z",
    areas: toAreas(
      [
        {
          label: "ดีลประจำเดือน",
          action: { type: "postback", data: "action=deal_of_month", text: "ดีลประจำเดือน", showInChat: true },
        },
        {
          label: "คูปองส่วนลด",
          action: { type: "postback" },
        },
        {
          label: "สมัครสมาชิก",
          action: { type: "uri", uri: "https://example.com/member" },
        },
      ],
      3,
      1
    ),
  },
];

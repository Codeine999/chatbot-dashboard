import { api } from "@/api/api";
import { resolveImageUrl } from "@/lib/url";

import { RICH_MENU_CANVAS, getLayout } from "../layout";
import type {
  PublishTarget,
  RichMenu,
  RichMenuButton,
  RichMenuCell,
  RichMenuTemplateDto,
} from "../type";

export const RICH_MENU_ENDPOINTS = {
  list: "/admin/rich-menus",
  create: "/admin/rich-menus",
  detail: (id: string) => `/admin/rich-menus/${id}`,
  update: (id: string) => `/admin/rich-menus/${id}`,
  remove: (id: string) => `/admin/rich-menus/${id}`,
  layout: (id: string) => `/admin/rich-menus/${id}/layout`,
  cellImage: (id: string, index: number) =>
    `/admin/rich-menus/${id}/cells/${index}/image`,
  validate: (id: string) => `/admin/rich-menus/${id}/validate`,
  publish: (id: string) => `/admin/rich-menus/${id}/publish`,
  setDefault: (id: string) => `/admin/rich-menus/${id}/default`,
  link: (id: string) => `/admin/rich-menus/${id}/link`,
} as const;

const MENU_POSTBACK_PREFIX = "menu=";

/**
 * จำนวนช่องของเมนู
 *
 * ใช้ค่าที่ backend เก็บไว้เสมอ นับจาก areas เองไม่ได้ เพราะช่องที่เป็นรูป
 * อย่างเดียวไม่มี area — เมนู 6 ช่องที่มีปุ่ม 3 ปุ่มจะถูกอ่านเป็น 3 ช่องทันที
 * เหลือการนับไว้เฉพาะเมนูเก่าที่ยังไม่มีค่านี้ ซึ่งทุกช่องเป็นปุ่มอยู่แล้ว
 */
const readCellCount = (dto: RichMenuTemplateDto): number => {
  if (dto.cellCount) return dto.cellCount;

  const fromImages = dto.cellImages.reduce(
    (highest, cell) => Math.max(highest, cell.index + 1),
    0,
  );
  const needed = Math.max(dto.areas.length, fromImages, 1);

  return [1, 2, 3, 4, 6].find((cells) => cells >= needed) ?? 6;
};

/** อ่านว่าช่องนี้ทำอะไร จาก area ที่ backend เก็บไว้ */
const readButton = (
  area: RichMenuTemplateDto["areas"][number],
): RichMenuButton => {
  const action = area.action;

  if (action.type === "postback" && typeof action.data === "string") {
    if (action.data.startsWith(MENU_POSTBACK_PREFIX)) {
      return {
        kind: "reply",
        replyKey: action.data.slice(MENU_POSTBACK_PREFIX.length),
      };
    }
  }

  if (action.type === "uri" && typeof action.uri === "string") {
    return { kind: "uri", uri: action.uri };
  }

  return { kind: "action", action };
};

/**
 * จับ area กลับเข้าช่อง โดยเทียบพิกัดมุมซ้ายบน
 *
 * area ไม่ได้มี index ติดมาด้วย เพราะ LINE ไม่มีแนวคิดเรื่องช่อง — bounds คือ
 * สิ่งเดียวที่บอกได้ว่าปุ่มนี้อยู่ตรงไหนของผัง
 */
const cellIndexOf = (
  area: RichMenuTemplateDto["areas"][number],
  cells: number,
  width: number,
  height: number,
): number => {
  const { columns, rows } = getLayout(cells);
  const column = Math.round((area.bounds.x / width) * columns);
  const row = Math.round((area.bounds.y / height) * rows);

  return row * columns + column;
};

export const mapRichMenu = (dto: RichMenuTemplateDto): RichMenu => {
  const cells = readCellCount(dto);
  const width = dto.width || RICH_MENU_CANVAS.width;
  const height = dto.height || RICH_MENU_CANVAS.height;

  const imageByIndex = new Map(
    dto.cellImages.map((cell) => [cell.index, cell]),
  );
  const buttonByIndex = new Map<number, RichMenuButton>();
  const labelByIndex = new Map<number, string>();

  dto.areas.forEach((area) => {
    const index = cellIndexOf(area, cells, width, height);
    buttonByIndex.set(index, readButton(area));
    if (typeof area.action.label === "string") {
      labelByIndex.set(index, area.action.label);
    }
  });

  const cellList: RichMenuCell[] = Array.from(
    { length: cells },
    (_, index) => ({
      index,
      label: labelByIndex.get(index) ?? "",
      button: buttonByIndex.get(index) ?? { kind: "none" },
      image: imageByIndex.get(index),
    }),
  );

  return {
    id: dto.id,
    name: dto.name,
    source: dto.lineRichMenuId ? "line" : "draft",
    status: dto.status,
    active: dto.isDefault,
    lineId: dto.lineRichMenuId,
    needsRepublish: dto.needsRepublish,
    lastPublishError: dto.lastPublishError,
    cells,
    cellList,
    image: dto.imagePath ? resolveImageUrl(dto.imagePath) : undefined,
    chatBarText: dto.chatBarText,
    width,
    height,
    updatedAt: dto.updatedAt,
  };
};

/** ปุ่มในรูปแบบที่ PUT /layout ต้องการ — null คือช่องที่กดไม่ได้ */
const toLayoutButton = (button: RichMenuButton) => {
  if (button.kind === "action") return { action: button.action };
  if (button.kind === "reply") return { replyKey: button.replyKey };
  if (button.kind === "uri") return { uri: button.uri };
  return null;
};

export const richMenuApi = {
  async getAll(): Promise<RichMenu[]> {
    const { data } = await api.get<RichMenuTemplateDto[]>(
      RICH_MENU_ENDPOINTS.list,
    );

    return data.map(mapRichMenu);
  },

  async create(name: string, chatBarText: string): Promise<RichMenu> {
    // เมนูใหม่ยังไม่มีปุ่มจริง แต่ LINE บังคับให้มี area อย่างน้อยหนึ่งอัน
    // จึงสร้างเป็นพื้นที่เต็มภาพที่เปิดลิงก์ไว้ก่อน แล้วให้ PUT /layout ทับทันที
    const { data } = await api.post<RichMenuTemplateDto>(
      RICH_MENU_ENDPOINTS.create,
      {
        name,
        chatBarText,
        size: {
          width: RICH_MENU_CANVAS.width,
          height: RICH_MENU_CANVAS.height,
        },
        selected: true,
        areas: [
          {
            bounds: {
              x: 0,
              y: 0,
              width: RICH_MENU_CANVAS.width,
              height: RICH_MENU_CANVAS.height,
            },
            action: { type: "uri", uri: "https://line.me" },
          },
        ],
      },
    );

    return mapRichMenu(data);
  },

  async rename(
    id: string,
    patch: { name?: string; chatBarText?: string },
  ): Promise<RichMenu> {
    const { data } = await api.patch<RichMenuTemplateDto>(
      RICH_MENU_ENDPOINTS.update(id),
      patch,
    );

    return mapRichMenu(data);
  },

  async saveLayout(
    id: string,
    cells: number,
    buttons: RichMenuButton[],
  ): Promise<RichMenu> {
    const { data } = await api.put<RichMenuTemplateDto>(
      RICH_MENU_ENDPOINTS.layout(id),
      {
        cells,
        buttons: Array.from({ length: cells }, (_, index) =>
          toLayoutButton(buttons[index] ?? { kind: "none" }),
        ),
      },
    );

    return mapRichMenu(data);
  },

  async uploadCellImage(
    id: string,
    index: number,
    file: File,
  ): Promise<RichMenu> {
    const form = new FormData();
    form.append("image", file);

    const { data } = await api.post<RichMenuTemplateDto>(
      RICH_MENU_ENDPOINTS.cellImage(id, index),
      form,
      // ปล่อยให้ browser ใส่ boundary เอง ถ้าไปตั้ง Content-Type ทับจะ parse ไม่ออก
      { headers: { "Content-Type": undefined } },
    );

    return mapRichMenu(data);
  },

  async removeCellImage(id: string, index: number): Promise<RichMenu> {
    const { data } = await api.delete<RichMenuTemplateDto>(
      RICH_MENU_ENDPOINTS.cellImage(id, index),
    );

    return mapRichMenu(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(RICH_MENU_ENDPOINTS.remove(id));
  },

  async validate(id: string): Promise<void> {
    await api.post(RICH_MENU_ENDPOINTS.validate(id), {});
  },

  async publish(
    id: string,
    target: PublishTarget,
    testUserId?: string,
  ): Promise<RichMenu> {
    const { data } = await api.post<RichMenuTemplateDto>(
      RICH_MENU_ENDPOINTS.publish(id),
      { setAsDefault: target === "all" },
    );

    // เผยแพร่แบบทดสอบ: เมนูอยู่บน LINE แล้วแต่ผูกให้เฉพาะ user ที่ระบุ
    if (target === "test" && testUserId) {
      await api.post(RICH_MENU_ENDPOINTS.link(id), {
        lineUserIds: [testUserId.trim()],
      });
    }

    return mapRichMenu(data);
  },
};

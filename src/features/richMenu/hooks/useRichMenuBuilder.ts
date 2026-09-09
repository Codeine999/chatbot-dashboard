import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  PUBLISH_STEPS,
  RICH_MENU_IMAGE_TYPES,
  RICH_MENU_MAX_IMAGE_MB,
  buildTemplateAreas,
  createId,
  getMenuIssues,
} from "../layout";
import { richMenusMock } from "../mock/richMenu.mock";
import type {
  PublishTarget,
  RichMenu,
  RichMenuArea,
  RichMenuFilter,
  RichMenuTemplateId,
} from "../type";

const STEP_DURATION_MS = 550;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** blob url ที่สร้างเองต้องคืนหน่วยความจำเอง ส่วน url จาก backend ห้ามไปแตะ */
const revokeIfBlob = (url?: string) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

export const useRichMenuBuilder = () => {
  const { t } = useTranslation("richMenu");

  const [menus, setMenus] = useState<RichMenu[]>(richMenusMock);
  const [selectedMenuId, setSelectedMenuId] = useState(richMenusMock[0].id);
  const [selectedAreaId, setSelectedAreaId] = useState(richMenusMock[0].areas[0].id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RichMenuFilter>("all");
  const [target, setTarget] = useState<PublishTarget>("all");
  const [testUserId, setTestUserId] = useState("");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string>(null);
  const [publishStep, setPublishStep] = useState(-1);
  const [publishing, setPublishing] = useState(false);

  /** ทุกครั้งที่ค่านี้เปลี่ยน ลำดับการเผยแพร่ที่ค้างอยู่จะถือว่าถูกยกเลิก */
  const publishRunRef = useRef(0);
  /** blob url ที่ยังไม่ถูกคืน ต้องเก็บไว้เอง เพราะ state หายไปพร้อมกับ component */
  const blobUrlsRef = useRef<string[]>([]);

  const cancelPublish = () => {
    publishRunRef.current += 1;
    setPublishing(false);
    setPublishStep(-1);
  };

  useEffect(
    () => () => {
      publishRunRef.current += 1;
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    },
    []
  );

  const selectedMenu = menus.find((menu) => menu.id === selectedMenuId) ?? menus[0];
  const selectedArea =
    selectedMenu?.areas.find((area) => area.id === selectedAreaId) ?? null;

  const issues = useMemo(() => getMenuIssues(selectedMenu), [selectedMenu]);

  const counts = useMemo(
    () => ({
      all: menus.length,
      draft: menus.filter((menu) => menu.source === "draft").length,
      line: menus.filter((menu) => menu.source === "line").length,
    }),
    [menus]
  );

  const visibleMenus = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return menus.filter((menu) => {
      const matchesFilter = filter === "all" || menu.source === filter;
      const matchesSearch =
        !keyword ||
        menu.name.toLowerCase().includes(keyword) ||
        menu.areas.some((area) => area.label.toLowerCase().includes(keyword));

      return matchesFilter && matchesSearch;
    });
  }, [menus, filter, search]);

  /** แก้เมนูที่เลือกอยู่ พร้อมประทับเวลาแก้ไขและตั้งสถานะว่ายังไม่บันทึก */
  const patchSelected = (patch: Partial<RichMenu>) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === selectedMenuId
          ? { ...menu, ...patch, updatedAt: new Date().toISOString() }
          : menu
      )
    );
    setDirty(true);
  };

  const selectMenu = (id: string) => {
    const menu = menus.find((item) => item.id === id);
    if (!menu) return;

    cancelPublish();
    setSelectedMenuId(id);
    setSelectedAreaId(menu.areas[0]?.id ?? null);
  };

  const renameMenu = (name: string) => patchSelected({ name });

  const setChatBarText = (chatBarText: string) => patchSelected({ chatBarText });

  const applyTemplate = (template: RichMenuTemplateId) => {
    if (!selectedMenu || selectedMenu.template === template) return;

    const areas = buildTemplateAreas(template, (index) =>
      t("builder.areaLabel", { index })
    );

    // ชื่อพื้นที่เดิมมีค่ากับผู้ใช้มากกว่าชื่อ default จึงยกมาใส่ช่องที่ตำแหน่งตรงกัน
    const merged = areas.map((area, index) => {
      const previous = selectedMenu.areas[index];
      return previous
        ? { ...area, label: previous.label, action: previous.action }
        : area;
    });

    patchSelected({ template, areas: merged });
    setSelectedAreaId(merged[0].id);
  };

  const updateArea = (areaId: string, patch: Partial<RichMenuArea>) => {
    if (!selectedMenu) return;

    patchSelected({
      areas: selectedMenu.areas.map((area) =>
        area.id === areaId ? { ...area, ...patch } : area
      ),
    });
  };

  const updateAreaAction = (
    areaId: string,
    patch: Partial<RichMenuArea["action"]>
  ) => {
    const area = selectedMenu?.areas.find((item) => item.id === areaId);
    if (!area) return;

    updateArea(areaId, { action: { ...area.action, ...patch } });
  };

  const setImageFile = (file: File) => {
    if (!file) return;

    if (!RICH_MENU_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("toast.imageType"));
      return;
    }

    if (file.size > RICH_MENU_MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(t("toast.imageTooLarge", { size: RICH_MENU_MAX_IMAGE_MB }));
      return;
    }

    revokeIfBlob(selectedMenu?.image);

    const url = URL.createObjectURL(file);
    blobUrlsRef.current = [...blobUrlsRef.current, url];
    patchSelected({ image: url });
  };

  const removeImage = () => {
    revokeIfBlob(selectedMenu?.image);
    patchSelected({ image: undefined });
  };

  const createMenu = () => {
    const areas = buildTemplateAreas("grid6", (index) =>
      t("builder.areaLabel", { index })
    );

    const menu: RichMenu = {
      id: createId("menu"),
      name: t("list.newName"),
      source: "draft",
      active: false,
      template: "grid6",
      chatBarText: t("publish.chatBarPlaceholder"),
      updatedAt: new Date().toISOString(),
      areas,
    };

    cancelPublish();
    setMenus((prev) => [menu, ...prev]);
    setSelectedMenuId(menu.id);
    setSelectedAreaId(areas[0].id);
    setFilter("all");
    setDirty(true);
    toast.success(t("toast.created"));
  };

  const duplicateMenu = (id: string) => {
    const source = menus.find((menu) => menu.id === id);
    if (!source) return;

    // สำเนาต้องเป็นร่างเสมอ เพราะยังไม่มี rich menu id ของตัวเองบน LINE
    const copy: RichMenu = {
      ...source,
      id: createId("menu"),
      name: `${source.name} (${t("list.copySuffix")})`,
      source: "draft",
      active: false,
      lineId: undefined,
      updatedAt: new Date().toISOString(),
      areas: source.areas.map((area) => ({
        ...area,
        id: createId("area"),
        action: { ...area.action },
        bounds: { ...area.bounds },
      })),
    };

    cancelPublish();
    setMenus((prev) => [copy, ...prev]);
    setSelectedMenuId(copy.id);
    setSelectedAreaId(copy.areas[0]?.id ?? null);
    setDirty(true);
    toast.success(t("toast.duplicated"));
  };

  const deleteMenu = (id: string) => {
    const menu = menus.find((item) => item.id === id);
    if (!menu) return;

    if (menu.active) {
      toast.error(t("toast.deleteActive"));
      return;
    }

    const rest = menus.filter((item) => item.id !== id);
    revokeIfBlob(menu.image);
    setMenus(rest);
    toast.success(t("toast.deleted"));

    if (id === selectedMenuId) {
      cancelPublish();
      setSelectedMenuId(rest[0]?.id ?? null);
      setSelectedAreaId(rest[0]?.areas[0]?.id ?? null);
    }
  };

  const saveDraft = () => {
    setDirty(false);
    setSavedAt(new Date().toISOString());
    toast.success(t("toast.draftSaved"));
  };

  const publish = async () => {
    if (publishing || !selectedMenu) return;

    if (issues.length) {
      toast.error(t("toast.hasIssues"));
      return;
    }

    if (target === "test" && !testUserId.trim()) {
      toast.error(t("toast.needTestUserId"));
      return;
    }

    publishRunRef.current += 1;
    const run = publishRunRef.current;
    setPublishing(true);

    for (let step = 0; step < PUBLISH_STEPS.length; step += 1) {
      setPublishStep(step);
      await wait(STEP_DURATION_MS);
      // เปลี่ยนเมนูหรือออกจากหน้าไปแล้วระหว่างรอ ผลลัพธ์เดิมจึงใช้ไม่ได้
      if (publishRunRef.current !== run) return;
    }

    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id !== selectedMenu.id) {
          // เมนูหลักมีได้ทีละหนึ่ง ตัวที่เคยใช้อยู่จึงต้องถูกปลด
          return target === "all" && menu.active ? { ...menu, active: false } : menu;
        }

        return {
          ...menu,
          source: "line",
          active: target === "all",
          lineId: createId("richmenu"),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setPublishing(false);
    setDirty(false);
    setSavedAt(new Date().toISOString());
    toast.success(t("toast.published"));
  };

  return {
    menus: visibleMenus,
    counts,
    selectedMenu,
    selectedArea,
    selectedAreaId,
    issues,
    search,
    filter,
    target,
    testUserId,
    dirty,
    savedAt,
    publishing,
    publishStep,
    setSearch,
    setFilter,
    setTarget,
    setTestUserId,
    setSelectedAreaId,
    selectMenu,
    createMenu,
    duplicateMenu,
    deleteMenu,
    renameMenu,
    setChatBarText,
    applyTemplate,
    updateArea,
    updateAreaAction,
    setImageFile,
    removeImage,
    saveDraft,
    publish,
  };
};

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  RICH_MENU_IMAGE_TYPES,
  RICH_MENU_MAX_IMAGE_MB,
  getMenuIssues,
} from "../layout";
import type {
  RichMenu,
  RichMenuButton,
  RichMenuFilter,
} from "../type";
import {
  useCreateRichMenu,
  useDeleteRichMenu,
  usePublishRichMenu,
  useRemoveCellImage,
  useRenameRichMenu,
  useRichMenuReplies,
  useRichMenus,
  useSaveRichMenuLayout,
  useUploadCellImage,
} from "./useRichMenuQueries";

/**
 * สถานะของหน้าจอ Rich Menu ทั้งหน้า
 *
 * เมนูทุกตัวมาจาก backend ตัวเดียว ไม่มีสำเนาในหน้าจอ ยกเว้นผังปุ่มที่ยังไม่
 * บันทึก (`draftButtons`) ซึ่งต้องแก้ได้ต่อเนื่องก่อนกด "บันทึกร่าง" ครั้งเดียว
 * ส่วนรูปอัปโหลดขึ้น backend ทันทีเพราะ backend เป็นคนประกอบภาพรวมให้
 */
export const useRichMenuBuilder = () => {
  const { t } = useTranslation("richMenu");

  const menusQuery = useRichMenus();
  const repliesQuery = useRichMenuReplies();

  const createMenuMutation = useCreateRichMenu();
  const renameMutation = useRenameRichMenu();
  const saveLayoutMutation = useSaveRichMenuLayout();
  const uploadCellMutation = useUploadCellImage();
  const removeCellMutation = useRemoveCellImage();
  const deleteMutation = useDeleteRichMenu();
  const publishMutation = usePublishRichMenu();

  const menus = useMemo(() => menusQuery.data ?? [], [menusQuery.data]);
  const replies = useMemo(() => repliesQuery.data ?? [], [repliesQuery.data]);

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RichMenuFilter>("all");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [publishStep, setPublishStep] = useState(-1);

  /** ผังที่กำลังแก้ ยังไม่ได้ส่งขึ้น backend — null คือยังไม่แตะอะไร */
  const [draft, setDraft] = useState<{
    menuId: string;
    cells: number;
    buttons: RichMenuButton[];
  } | null>(null);

  /** ค่านี้เปลี่ยนเมื่อไหร่ ลำดับ publish ที่ค้างอยู่ถือว่าถูกยกเลิก */
  const publishRunRef = useRef(0);

  const selectedMenu =
    menus.find((menu) => menu.id === selectedMenuId) ?? menus[0];

  // เลือกเมนูแรกให้เองเมื่อโหลดเสร็จ และตามไปเมนูใหม่เมื่อเมนูที่เลือกถูกลบ
  useEffect(() => {
    if (!menus.length) {
      setSelectedMenuId(null);
      return;
    }

    if (!menus.some((menu) => menu.id === selectedMenuId)) {
      setSelectedMenuId(menus[0].id);
      setSelectedCell(0);
      setDraft(null);
    }
  }, [menus, selectedMenuId]);

  /** ผังที่หน้าจอแสดง: ร่างถ้ามี ไม่งั้นคือของจริงจาก backend */
  const cells =
    draft && draft.menuId === selectedMenu?.id
      ? draft.cells
      : (selectedMenu?.cells ?? 6);

  const buttons: RichMenuButton[] = useMemo(() => {
    if (draft && draft.menuId === selectedMenu?.id) return draft.buttons;

    return Array.from(
      { length: selectedMenu?.cells ?? 0 },
      (_, index) =>
        selectedMenu?.cellList[index]?.button ?? ({ kind: "none" } as const),
    );
  }, [draft, selectedMenu]);

  const replyByKey = useMemo(
    () => new Map(replies.map((reply) => [reply.key, reply])),
    [replies],
  );

  /**
   * ช่องที่แสดงบนผัง — ผสมร่างที่ยังไม่บันทึกเข้ากับรูปที่อัปโหลดไปแล้ว
   * ข้อความบนปุ่มอ่านจากคลังคำตอบเสมอ ไม่ได้อ่านจากสำเนาที่ฝังอยู่ใน area
   * แก้ข้อความคำตอบแล้วผังจึงเปลี่ยนตามทันทีโดยไม่ต้องบันทึกเมนูใหม่
   */
  const cellList = useMemo(() => {
    if (!selectedMenu) return [];

    return Array.from({ length: cells }, (_, index) => {
      const button = buttons[index] ?? { kind: "none" as const };
      const reply =
        button.kind === "reply" ? replyByKey.get(button.replyKey) : undefined;

      return {
        index,
        label:
          reply?.label ??
          (button.kind === "action"
            ? (button.action.label ?? button.action.type)
            : undefined) ??
          (button.kind === "uri"
            ? t("cell.linkLabel")
            : t("cell.emptyLabel", { index: index + 1 })),
        button,
        image: selectedMenu.cellList[index]?.image,
        /** ปุ่มชี้ไปที่คำตอบที่ถูกลบหรือปิดอยู่ */
        missingReply: button.kind === "reply" && !reply,
      };
    });
  }, [cells, buttons, replyByKey, selectedMenu, t]);

  const menuForIssues = useMemo(
    () => (selectedMenu ? { ...selectedMenu, cells, cellList } : undefined),
    [selectedMenu, cells, cellList],
  );

  const issues = useMemo(
    () => getMenuIssues(menuForIssues as RichMenu | undefined),
    [menuForIssues],
  );

  const dirty = Boolean(draft && draft.menuId === selectedMenu?.id);

  const counts = useMemo(
    () => ({
      all: menus.length,
      draft: menus.filter((menu) => menu.source === "draft").length,
      line: menus.filter((menu) => menu.source === "line").length,
    }),
    [menus],
  );

  const visibleMenus = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return menus.filter((menu) => {
      const matchesFilter = filter === "all" || menu.source === filter;
      const matchesSearch =
        !keyword ||
        menu.name.toLowerCase().includes(keyword) ||
        menu.cellList.some((cell) =>
          cell.label.toLowerCase().includes(keyword),
        );

      return matchesFilter && matchesSearch;
    });
  }, [menus, filter, search]);

  const cancelPublish = () => {
    publishRunRef.current += 1;
    setPublishStep(-1);
  };

  const patchDraft = (
    next: Partial<{ cells: number; buttons: RichMenuButton[] }>,
  ) => {
    if (!selectedMenu) return;

    setDraft({
      menuId: selectedMenu.id,
      cells: next.cells ?? cells,
      buttons: next.buttons ?? buttons,
    });
  };

  const selectMenu = (id: string) => {
    if (id === selectedMenu?.id) return;

    cancelPublish();
    setSelectedMenuId(id);
    setSelectedCell(0);
    setDraft(null);
  };

  const renameMenu = (name: string) => {
    if (!selectedMenu) return;
    renameMutation.mutate({ id: selectedMenu.id, name });
  };

  const setChatBarText = (chatBarText: string) => {
    if (!selectedMenu) return;
    renameMutation.mutate({ id: selectedMenu.id, chatBarText });
  };

  /** เปลี่ยนจำนวนช่อง — ปุ่มเดิมถูกยกมาใส่ช่องที่ตำแหน่งตรงกันเท่าที่มีที่ว่าง */
  const applyLayout = (nextCells: number) => {
    if (!selectedMenu || nextCells === cells) return;

    patchDraft({
      cells: nextCells,
      buttons: Array.from(
        { length: nextCells },
        (_, index) => buttons[index] ?? ({ kind: "none" } as const),
      ),
    });

    if (selectedCell >= nextCells) setSelectedCell(nextCells - 1);
  };

  const setCellButton = (index: number, button: RichMenuButton) => {
    const next = [...buttons];
    next[index] = button;
    patchDraft({ buttons: next });
  };

  const imageUploadRef = useRef(false);
  const [preparingImage, setPreparingImage] = useState(false);

  const setCellImage = async (index: number, file: File) => {
    if (!selectedMenu || imageUploadRef.current) return;

    if (!RICH_MENU_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("toast.imageType"));
      return;
    }

    if (file.size > RICH_MENU_MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(t("toast.imageTooLarge", { size: RICH_MENU_MAX_IMAGE_MB }));
      return;
    }

    imageUploadRef.current = true;
    setPreparingImage(true);
    try {
      if (dirty) {
        await saveLayoutMutation.mutateAsync({
          id: selectedMenu.id,
          cells,
          buttons,
        });
        setDraft(null);
      }
      await uploadCellMutation.mutateAsync({
        id: selectedMenu.id,
        index,
        file,
      });
    } catch {
      // Mutation handlers already display the API error.
    } finally {
      imageUploadRef.current = false;
      setPreparingImage(false);
    }
  };

  const removeCellImage = (index: number) => {
    if (!selectedMenu) return;
    removeCellMutation.mutate({ id: selectedMenu.id, index });
  };

  const createMenu = () => {
    createMenuMutation.mutate(
      { name: t("list.newName"), chatBarText: t("publish.chatBarPlaceholder") },
      {
        onSuccess: () => {
          cancelPublish();
          setDraft(null);
          setSelectedCell(0);
          setFilter("all");
        },
      },
    );
  };

  const deleteMenu = (id: string) => {
    const menu = menus.find((item) => item.id === id);
    if (!menu) return;

    if (menu.active) {
      toast.error(t("toast.deleteActive"));
      return;
    }

    deleteMutation.mutate({ id });
  };

  const saveDraft = () => {
    if (!selectedMenu || !dirty) return;

    saveLayoutMutation.mutate(
      { id: selectedMenu.id, cells, buttons },
      {
        onSuccess: () => {
          setDraft(null);
          setSavedAt(new Date().toISOString());
        },
      },
    );
  };

  const publish = async () => {
    if (!selectedMenu || publishMutation.isPending) return;

    if (issues.length) {
      toast.error(t("toast.hasIssues"));
      return;
    }

    // ผังที่ยังไม่บันทึกต้องขึ้น backend ก่อน ไม่งั้นจะเผยแพร่ของเก่า
    if (dirty) {
      try {
        await saveLayoutMutation.mutateAsync({
          id: selectedMenu.id,
          cells,
          buttons,
        });
        setDraft(null);
      } catch {
        return; // mutation แจ้ง error ให้แล้ว
      }
    }

    publishRunRef.current += 1;
    const run = publishRunRef.current;
    setPublishStep(0);

    try {
      // หน้าจอไม่มีตัวเลือกกลุ่มเป้าหมายแล้ว เผยแพร่หาทุกคนเสมอ
      await publishMutation.mutateAsync({
        id: selectedMenu.id,
        target: "all",
      });

      if (publishRunRef.current !== run) return;

      setPublishStep(-1);
      setSavedAt(new Date().toISOString());
    } catch {
      if (publishRunRef.current === run) setPublishStep(-1);
    }
  };

  return {
    menus: visibleMenus,
    replies,
    counts,
    selectedMenu: menuForIssues as RichMenu | undefined,
    cells,
    cellList,
    selectedCell,
    issues,
    search,
    filter,
    dirty,
    savedAt,
    loading: menusQuery.isLoading || repliesQuery.isLoading,
    saving: saveLayoutMutation.isPending,
    uploading:
      preparingImage ||
      uploadCellMutation.isPending ||
      removeCellMutation.isPending,
    publishing: publishMutation.isPending,
    publishStep,
    setSearch,
    setFilter,
    setSelectedCell,
    selectMenu,
    createMenu,
    deleteMenu,
    renameMenu,
    setChatBarText,
    applyLayout,
    setCellButton,
    setCellImage,
    removeCellImage,
    saveDraft,
    publish,
  };
};

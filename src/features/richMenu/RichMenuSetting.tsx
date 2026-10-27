import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutGrid, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { formatTime } from "@/i18n/format";

import { CellInspector } from "./components/CellInspector";
import { MenuCanvas } from "./components/MenuCanvas";
import { PublishPanel } from "./components/PublishPanel";
import { ReplyLibrary } from "./components/ReplyLibrary";
import { RichMenuList } from "./components/RichMenuList";
import { useRichMenuBuilder } from "./hooks/useRichMenuBuilder";
import {
  useCreateRichMenuReply,
  useDeleteRichMenuReply,
  useUpdateRichMenuReply,
} from "./hooks/useRichMenuQueries";

export const RichMenuSetting = () => {
  const { t } = useTranslation("richMenu");
  const builder = useRichMenuBuilder();

  const createReply = useCreateRichMenuReply();
  const updateReply = useUpdateRichMenuReply();
  const deleteReply = useDeleteRichMenuReply();

  /** คำตอบที่กำลังกางอยู่ในคลัง — แผงช่องสั่งเปิดได้ด้วยปุ่มดินสอ */
  const [editingReplyKey, setEditingReplyKey] = useState<string | null>(null);

  const {
    selectedMenu,
    cells,
    cellList,
    selectedCell,
    replies,
    issues,
    dirty,
    savedAt,
    loading,
    saving,
    uploading,
    publishing,
  } = builder;

  const replyByKey = useMemo(
    () => new Map(replies.map((reply) => [reply.key, reply])),
    [replies]
  );

  /** เติมข้อความคำตอบให้ช่อง เพื่อให้ตัวอย่างในเครื่องแสดงบทสนทนาจริงได้ */
  const previewCells = useMemo(
    () =>
      cellList.map((cell) => ({
        ...cell,
        replyText:
          cell.button.kind === "reply"
            ? replyByKey.get(cell.button.replyKey)?.replyText
            : undefined,
      })),
    [cellList, replyByKey]
  );

  const savedLabel = dirty
    ? t("page.unsaved")
    : savedAt
      ? t("page.savedAt", { time: formatTime(savedAt) })
      : "";

  return (
    <PageContainer>
      <PageHeader
        title={t("page.title")}
        subtitle={t("page.subtitle")}
        actions={
          <>
            {savedLabel && (
              <p className="hidden text-xs text-mini sm:block">{savedLabel}</p>
            )}

            <Button
              variant="outline"
              onClick={builder.saveDraft}
              disabled={!dirty || saving}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {t("page.saveDraft")}
            </Button>

            <Button
              onClick={builder.publish}
              disabled={publishing || !selectedMenu || issues.length > 0}
            >
              {publishing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {publishing ? t("page.publishing") : t("page.publish")}
            </Button>
          </>
        }
      />

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[17.5rem_minmax(0,1fr)_21rem]">
        <RichMenuList
          menus={builder.menus}
          counts={builder.counts}
          selectedMenuId={selectedMenu?.id}
          search={builder.search}
          filter={builder.filter}
          onSearchChange={builder.setSearch}
          onFilterChange={builder.setFilter}
          onSelect={builder.selectMenu}
          onCreate={builder.createMenu}
          onDelete={builder.deleteMenu}
        />

        {loading ? (
          <Card className="flex items-center justify-center px-6 py-20 xl:col-span-2">
            <Loader2 className="size-5 animate-spin text-mini" />
          </Card>
        ) : selectedMenu ? (
          <>
            <MenuCanvas
              menu={selectedMenu}
              cells={cells}
              cellList={previewCells}
              selectedCell={selectedCell}
              issueCount={issues.length}
              uploading={uploading}
              onSelectCell={builder.setSelectedCell}
              onRename={builder.renameMenu}
              onApplyLayout={builder.applyLayout}
              onPickCellImage={builder.setCellImage}
              onRemoveCellImage={builder.removeCellImage}
            />

            <div className="flex flex-col gap-4">
              <CellInspector
                menu={selectedMenu}
                cell={cellList[selectedCell]}
                replies={replies}
                onChangeButton={builder.setCellButton}
                onEditReply={setEditingReplyKey}
              />

              <ReplyLibrary
                replies={replies}
                loading={loading}
                saving={
                  createReply.isPending ||
                  updateReply.isPending ||
                  deleteReply.isPending
                }
                editingKey={editingReplyKey}
                onEditingKeyChange={setEditingReplyKey}
                onCreate={(draft) => createReply.mutate(draft)}
                onUpdate={(id, patch) => updateReply.mutate({ id, ...patch })}
                onDelete={(id) => deleteReply.mutate({ id })}
              />

              <PublishPanel
                menu={selectedMenu}
                issues={issues}
                publishing={publishing}
                publishStep={builder.publishStep}
                onChatBarTextChange={builder.setChatBarText}
                onSelectCell={builder.setSelectedCell}
              />
            </div>
          </>
        ) : (
          <Card className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center xl:col-span-2">
            <LayoutGrid className="size-6 text-mini" />
            <p className="text-sm text-mini">{t("list.empty")}</p>
            <Button variant="outline" onClick={builder.createMenu}>
              {t("list.create")}
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

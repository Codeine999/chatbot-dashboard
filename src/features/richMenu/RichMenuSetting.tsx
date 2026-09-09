import { useTranslation } from "react-i18next";
import { LayoutGrid, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatTime } from "@/i18n/format";

import { AreaInspector } from "./components/AreaInspector";
import { MenuCanvas } from "./components/MenuCanvas";
import { PublishPanel } from "./components/PublishPanel";
import { RichMenuList } from "./components/RichMenuList";
import { useRichMenuBuilder } from "./hooks/useRichMenuBuilder";

export const RichMenuSetting = () => {
  const { t } = useTranslation("richMenu");
  const builder = useRichMenuBuilder();

  const {
    selectedMenu,
    selectedArea,
    selectedAreaId,
    issues,
    dirty,
    savedAt,
    publishing,
  } = builder;

  const savedLabel = dirty
    ? t("page.unsaved")
    : savedAt
      ? t("page.savedAt", { time: formatTime(savedAt) })
      : "";

  return (
    <div className="mt-10 mb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-normal">{t("page.title")}</h1>
          <p className="mt-2 text-sm text-mini">{t("page.subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          {savedLabel && (
            <p className="hidden text-xs text-mini sm:block">{savedLabel}</p>
          )}

          <Button variant="outline" onClick={builder.saveDraft} disabled={!dirty}>
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
        </div>
      </header>

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
          onDuplicate={builder.duplicateMenu}
          onDelete={builder.deleteMenu}
        />

        {selectedMenu ? (
          <>
            <MenuCanvas
              menu={selectedMenu}
              selectedAreaId={selectedAreaId}
              issueCount={issues.length}
              onSelectArea={builder.setSelectedAreaId}
              onRename={builder.renameMenu}
              onApplyTemplate={builder.applyTemplate}
              onPickImage={builder.setImageFile}
              onRemoveImage={builder.removeImage}
            />

            <div className="flex flex-col gap-4">
              <AreaInspector
                menu={selectedMenu}
                area={selectedArea}
                onUpdateArea={builder.updateArea}
                onUpdateAction={builder.updateAreaAction}
              />

              <PublishPanel
                menu={selectedMenu}
                issues={issues}
                target={builder.target}
                testUserId={builder.testUserId}
                publishing={publishing}
                publishStep={builder.publishStep}
                onChatBarTextChange={builder.setChatBarText}
                onTargetChange={builder.setTarget}
                onTestUserIdChange={builder.setTestUserId}
                onSelectArea={builder.setSelectedAreaId}
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
    </div>
  );
};

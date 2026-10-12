import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Boxes, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MicroKnowledgeTable from "./MicroKnowledgeTable";
import MicroKnowledgeEditPanel from "./MicroKnowledgeEditPanel";
import {
  useDeleteMicroKnowledge,
  useMicroKnowledgeList,
  useSaveMicroKnowledge,
} from "../hooks/useMicroKnowledge";
import type { SysCategory } from "../type/knowledge.type";
import type {
  MicroKnowledgeDraft,
  MicroKnowledgeItem,
} from "../type/microKnowledge.type";

const PRIORITY_RANGES: Record<string, [number, number]> = {
  high: [90, 100],
  medium: [70, 89],
  low: [0, 69],
};

type Props = {
  categories: SysCategory[];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  editing?: MicroKnowledgeItem;
  panelOpen: boolean;
  onOpenEditor: (item?: MicroKnowledgeItem) => void;
  onClosePanel: () => void;
};

const MicroKnowledgeTab = ({
  categories,
  isCategoriesLoading,
  isCategoriesError,
  editing,
  panelOpen,
  onOpenEditor,
  onClosePanel,
}: Props) => {
  const { t } = useTranslation("knowledge");
  const { data, isLoading, isError, refetch } = useMicroKnowledgeList();
  const saveMicroKnowledge = useSaveMicroKnowledge();
  const deleteMicroKnowledge = useDeleteMicroKnowledge();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const items = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (status === "active" && !item.active) return false;
      if (status === "inactive" && item.active) return false;

      if (priority !== "all") {
        const [min, max] = PRIORITY_RANGES[priority];
        if (item.priority < min || item.priority > max) return false;
      }

      if (!keyword) return true;

      return [
        item.title,
        item.category,
        item.intentKey,
        item.entityKey,
        item.topicKey,
        ...item.keywords,
      ].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [items, search, category, status, priority]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePublish = (draft: MicroKnowledgeDraft) => {
    saveMicroKnowledge.mutate(
      editing?.id ? { id: editing.id, original: editing, draft } : { draft },
      { onSuccess: () => onClosePanel() }
    );
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  const toggleSelectAll = () =>
    setSelectedIds((current) =>
      current.length === pageItems.length ? [] : pageItems.map((item) => item.id)
    );

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="flex min-w-0 flex-col p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-45 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mini" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t("micro.searchPlaceholder")}
              className="pl-9"
            />
          </div>

          <Select
            value={category}
            disabled={isCategoriesLoading}
            onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("filter.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allCategories")}</SelectItem>
              {categories.map((categoryOption) => (
                <SelectItem key={categoryOption.id} value={categoryOption.name}>
                  {categoryOption.name}
                </SelectItem>
              ))}
              {isCategoriesError && (
                <SelectItem value="categories-error" disabled>
                  {t("filter.categoriesError")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("filter.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
              <SelectItem value="active">{t("filter.active")}</SelectItem>
              <SelectItem value="inactive">{t("filter.inactive")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("filter.priorityAll")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.priorityAll")}</SelectItem>
              <SelectItem value="high">{t("filter.priorityHigh")}</SelectItem>
              <SelectItem value="medium">{t("filter.priorityMedium")}</SelectItem>
              <SelectItem value="low">{t("filter.priorityLow")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3">
          <MicroKnowledgeTable
            items={pageItems}
            compact={panelOpen}
            selectedIds={selectedIds}
            activeId={panelOpen ? editing?.id : undefined}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onEdit={onOpenEditor}
            onDelete={(id) => deleteMicroKnowledge.mutate(id)}
          />
        </div>

        {/* Pagination */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <p className="text-xs text-mini">
            {t("pagination.showing", {
              from: filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1,
              to: Math.min(currentPage * rowsPerPage, filtered.length),
              total: filtered.length,
            })}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-mini">{t("pagination.rowsPerPage")}</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label={t("pagination.previous")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-2 text-xs text-normal">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                aria-label={t("pagination.next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div
        className={`relative min-h-0 xl:self-stretch ${
          panelOpen ? "h-[calc(100svh-2rem)] xl:h-auto" : "hidden xl:block"
        }`}
      >
        {panelOpen ? (
          <MicroKnowledgeEditPanel
            item={editing}
            categories={categories}
            isSaving={saveMicroKnowledge.isPending}
            onClose={onClosePanel}
            onPublish={handlePublish}
          />
        ) : (
          <Card className="absolute inset-0 flex items-center justify-center p-10 text-center">
            <div>
              <Boxes className="mx-auto h-8 w-8 text-mini" />
              <p className="mt-3 text-sm text-normal">{t("micro.emptyPanel.title")}</p>
              <p className="mt-1 text-xs text-mini">{t("micro.emptyPanel.hint")}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MicroKnowledgeTab;

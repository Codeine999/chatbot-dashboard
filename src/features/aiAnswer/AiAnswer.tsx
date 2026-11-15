import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/common/PageContainer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KnowledgeStatsCards from "./components/KnowledgeStats";
import KnowledgeTable from "./components/KnowledgeTable";
import KnowledgeEditPanel from "./components/KnowledgeEditPanel";
import MicroKnowledgeTab from "./components/MicroKnowledgeTab";
import {
  useDeleteKnowledge,
  useKnowledgeCategories,
  useKnowledgeList,
  useKnowledgeStats,
  useSaveKnowledge,
} from "./hooks/useKnowledge";
import { useMicroKnowledgeStats } from "./hooks/useMicroKnowledge";
import type { KnowledgeDraft, KnowledgeItem } from "./type/knowledge.type";
import type { MicroKnowledgeItem } from "./type/microKnowledge.type";
import { useTranslation } from "react-i18next";

// เก็บเป็น key ของแท็บ ไม่ใช่ข้อความ เพราะ state `tab` เอาไปเทียบกันด้วย
const TABS = ["entries", "micro", "import", "settings"] as const;

type Tab = (typeof TABS)[number];

const PRIORITY_RANGES: Record<string, [number, number]> = {
  high: [90, 100],
  medium: [70, 89],
  low: [0, 69],
};

export const AiAnswer = () => {
  const { t } = useTranslation("knowledge");
  const { data, isLoading, isError, refetch } = useKnowledgeList();
  const {
    data: categoryList,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useKnowledgeCategories();
  const categoryOptions = categoryList?.data ?? [];
  const stats = useKnowledgeStats();
  const microStats = useMicroKnowledgeStats();
  const saveKnowledge = useSaveKnowledge();
  const deleteKnowledge = useDeleteKnowledge();

  const [tab, setTab] = useState<Tab>(TABS[0]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<KnowledgeItem | undefined>();
  const [panelOpen, setPanelOpen] = useState(false);
  const [microEditing, setMicroEditing] = useState<MicroKnowledgeItem | undefined>();
  const [microPanelOpen, setMicroPanelOpen] = useState(false);

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

      return [item.title, item.category, item.intentKey, ...item.keywords].some(
        (value) => value.toLowerCase().includes(keyword)
      );
    });
  }, [items, search, category, status, priority]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openEditor = (item?: KnowledgeItem) => {
    setEditing(item);
    setPanelOpen(true);
  };

  const openMicroEditor = (item?: MicroKnowledgeItem) => {
    setMicroEditing(item);
    setMicroPanelOpen(true);
  };

  /** ปุ่ม Add ด้านบนใช้ร่วมกันทั้งสองแท็บ จึงเปิดฟอร์มให้ตรงกับแท็บที่เปิดอยู่ */
  const handleAdd = () =>
    tab === "micro" ? openMicroEditor(undefined) : openEditor(undefined);

  const handlePublish = (draft: KnowledgeDraft) => {
    saveKnowledge.mutate(
      editing?.id
        ? { id: editing.id, original: editing, draft }
        : { draft },
      { onSuccess: () => setPanelOpen(false) }
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
    <PageContainer className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-normal">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-[10px] px-3.5 text-sm font-medium shadow-none"
            onClick={() => setTab(TABS[2])}
          >
            <Upload className="size-4" />
            {t("bulkImport")}
          </Button>

          <Button
            className="h-10 gap-2 rounded-[10px] bg-foreground pl-3.5 pr-4 text-sm font-medium text-background hover:bg-foreground/85"
            onClick={handleAdd}
          >
            <Plus className="size-4" />
            {tab === "micro" ? t("micro.add") : t("add")}
          </Button>
        </div>
      </div>

      {(() => {
        const tabsBar = (
          <div role="tablist" className="flex gap-6 overflow-x-auto border-b">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                role="tab"
                aria-selected={tab === name}
                className={`-mb-px h-11 shrink-0 cursor-pointer border-b-2 text-sm font-medium transition-colors ${
                  tab === name
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`tab.${name}`)}
              </button>
            ))}
          </div>
        );

        if (tab === "micro") {
          return (
            <>
              <div className="mt-8">
                <KnowledgeStatsCards stats={microStats} />
              </div>
              <div className="mt-9">{tabsBar}</div>
              <div className="mt-5">
                <MicroKnowledgeTab
                  categories={categoryOptions}
                  isCategoriesLoading={isCategoriesLoading}
                  isCategoriesError={isCategoriesError}
                  editing={microEditing}
                  panelOpen={microPanelOpen}
                  onOpenEditor={openMicroEditor}
                  onClosePanel={() => setMicroPanelOpen(false)}
                />
              </div>
            </>
          );
        }

        if (tab !== TABS[0]) {
          return (
            <>
              <div className="mt-8">
                <KnowledgeStatsCards stats={stats} />
              </div>
              <div className="mt-9">{tabsBar}</div>
              <Card variant="flat" className="mt-5 p-10 text-center">
                <p className="text-sm text-foreground">{t(`tab.${tab}`)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("tabTodo")}</p>
              </Card>
            </>
          );
        }

        return (
          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-0">
            <div className="flex min-w-0 flex-col xl:pr-8">
              <KnowledgeStatsCards stats={stats} />
              <div className="mt-9">{tabsBar}</div>

              <Card variant="flat" className="mt-5 flex min-w-0 flex-col">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-45 flex-1">
                    <Search className="absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder={t("filter.searchPlaceholder")}
                      className="h-10 rounded-[10px] border-0 bg-muted pl-9 text-sm shadow-none focus-visible:ring-1"
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
                    <SelectTrigger className="h-10 rounded-[10px] text-[13px] font-medium shadow-none w-40">
                      <SelectValue placeholder={t("filter.allCategories")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filter.allCategories")}</SelectItem>
                      {categoryOptions.map((categoryOption) => (
                        <SelectItem
                          key={categoryOption.id}
                          value={categoryOption.name}
                        >
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
                    <SelectTrigger className="h-10 rounded-[10px] text-[13px] font-medium shadow-none w-36">
                      <SelectValue placeholder={t("filter.allStatuses")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
                      <SelectItem value="active">{t("filter.active")}</SelectItem>
                      <SelectItem value="inactive">{t("filter.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-10 rounded-[10px] text-[13px] font-medium shadow-none w-44">
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
                  <KnowledgeTable
                    items={pageItems}
                    compact={panelOpen}
                    selectedIds={selectedIds}
                    activeId={panelOpen ? editing?.id : undefined}
                    isLoading={isLoading}
                    isError={isError}
                    onRetry={() => refetch()}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onEdit={openEditor}
                    onDelete={(id) => deleteKnowledge.mutate(id)}
                  />
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground">
                  <p>
                    {t("pagination.showing", {
                      from: filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1,
                      to: Math.min(currentPage * rowsPerPage, filtered.length),
                      total: filtered.length,
                    })}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span>{t("pagination.rowsPerPage")}</span>
                      <Select
                        value={String(rowsPerPage)}
                        onValueChange={(value) => {
                          setRowsPerPage(Number(value));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-9 w-[72px] rounded-lg text-[13px] shadow-none">
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
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-lg shadow-none"
                        disabled={currentPage === 1}
                        onClick={() => setPage(currentPage - 1)}
                        aria-label={t("pagination.previous")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="px-2 font-mono text-foreground">
                        {currentPage} / {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-lg shadow-none"
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
            </div>

            <div
              className={`relative min-h-0 xl:min-h-[calc(100svh-15rem)] xl:self-stretch xl:border-l ${
                panelOpen ? "h-[calc(100svh-2rem)] xl:h-auto" : "hidden xl:block"
              }`}
            >
              {panelOpen ? (
                <KnowledgeEditPanel
                  item={editing}
                  categories={categoryOptions}
                  isSaving={saveKnowledge.isPending}
                  onClose={() => setPanelOpen(false)}
                  onPublish={handlePublish}
                />
              ) : (
                <Card variant="flat" className="absolute inset-0 flex items-center justify-center p-10 text-center">
                  <div>
                    <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-medium text-foreground">{t("emptyPanel.title")}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{t("emptyPanel.hint")}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );
      })()}
    </PageContainer>
  );
};

export default AiAnswer;

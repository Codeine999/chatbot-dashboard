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
import {
  useDeleteKnowledge,
  useKnowledgeCategories,
  useKnowledgeList,
  useKnowledgeStats,
  useSaveKnowledge,
} from "./hooks/useKnowledge";
import type { KnowledgeDraft, KnowledgeItem } from "./type/knowledge.type";

const TABS = ["Knowledge Entries", "Retrieval Test", "Import / Sync", "Settings"];

const PRIORITY_RANGES: Record<string, [number, number]> = {
  high: [90, 100],
  medium: [70, 89],
  low: [0, 69],
};

export const AiAnswer = () => {
  const { data, isLoading, isError, refetch } = useKnowledgeList();
  const {
    data: categoryList,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useKnowledgeCategories();
  const categoryOptions = categoryList?.data ?? [];
  const stats = useKnowledgeStats();
  const saveKnowledge = useSaveKnowledge();
  const deleteKnowledge = useDeleteKnowledge();

  const [tab, setTab] = useState(TABS[0]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<KnowledgeItem | undefined>();
  const [panelOpen, setPanelOpen] = useState(false);

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
    <div className="mt-6 mb-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-icons dark:bg-purple-500/10">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-normal">AI Knowledge Base</h1>
            <p className="text-sm text-mini">
              Manage the knowledge your AI uses to answer customer questions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <Button variant="ghost" className="border gap-1.5" onClick={() => setTab(TABS[2])}>
            <Upload className="h-4 w-4 text-icons" />
            Bulk Import
          </Button>

          <Button className="gap-1.5" onClick={() => openEditor(undefined)}>
            <Plus className="h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {(() => {
        const tabsBar = (
          <div className="flex gap-6 border-b mt-4">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`-mb-px border-b-2 pb-2 text-sm transition ${
                  tab === name
                    ? "border-icons font-medium text-icons"
                    : "border-transparent text-mini hover:text-normal"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        );

        if (tab !== TABS[0]) {
          return (
            <>
              <div className="mt-5">
                <KnowledgeStatsCards stats={stats} />
              </div>
              <div className="mt-6">{tabsBar}</div>
              <Card className="mt-4 p-10 text-center">
                <p className="text-sm text-normal">{tab}</p>
                <p className="mt-1 text-xs text-mini">
                  ยังไม่ได้ทำแท็บนี้ — ใช้ช่อง Retrieval Preview ในการ์ดขวาทดสอบได้ก่อน
                </p>
              </Card>
            </>
          );
        }

        return (
          <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex min-w-0 flex-col gap-4">
              <KnowledgeStatsCards stats={stats} />
              {tabsBar}

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
                      placeholder="Search entries..."
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
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                          โหลดหมวดหมู่ไม่สำเร็จ
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Priority: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Priority: All</SelectItem>
                      <SelectItem value="high">High (90-100)</SelectItem>
                      <SelectItem value="medium">Medium (70-89)</SelectItem>
                      <SelectItem value="low">Low (0-69)</SelectItem>
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
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <p className="text-xs text-mini">
                    Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}{" "}
                    entries
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-mini">Rows per page</span>
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
                        aria-label="Previous page"
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
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div
              className={`relative min-h-0 xl:self-stretch ${
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
                <Card className="absolute inset-0 flex items-center justify-center p-10 text-center">
                  <div>
                    <BookOpen className="mx-auto h-8 w-8 text-mini" />
                    <p className="mt-3 text-sm text-normal">เลือก entry เพื่อดูรายละเอียด</p>
                    <p className="mt-1 text-xs text-mini">
                      คลิกแถวในตาราง หรือกด Add Knowledge เพื่อสร้างใหม่
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AiAnswer;

import { useTranslation } from "react-i18next";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/time";
import { categoryDot, truncate } from "../utils/table";
import type { KnowledgeItem } from "../type/knowledge.type";

const checkboxClass =
  "size-4 rounded-[4px] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";

type Props = {
  items: KnowledgeItem[];
  selectedIds: string[];
  /** คงไว้เพื่อ API เดิม (แผงรายละเอียดเปิดอยู่) */
  compact?: boolean;
  activeId?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
};

const KnowledgeTable = ({
  items,
  selectedIds,
  compact = false,
  activeId,
  isLoading,
  isError,
  onRetry,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
}: Props) => {
  const { t } = useTranslation("knowledge");
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const thClass = "h-auto whitespace-nowrap px-3 py-3 text-left text-xs font-medium text-muted-foreground";
  const tdClass = "px-3 py-3.5 align-top";
  // แผงรายละเอียดเปิดอยู่ ตารางเหลือที่น้อย จึงซ่อนคอลัมน์ที่สำคัญน้อยสุด
  const colSpan = compact ? 6 : 8;

  return (
    <div className="overflow-x-auto">
      <Table className={`border-collapse text-sm ${compact ? "min-w-[560px]" : "min-w-[860px]"}`}>
        <TableHeader className="[&_tr]:border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${thClass} w-9 pl-0`}>
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label={t("table.selectAll")}
                className={checkboxClass}
              />
            </TableHead>
            <TableHead className={`${thClass} pl-0`}>{t("table.title")}</TableHead>
            <TableHead className={thClass}>
              {t("table.category")} / {t("table.intentKey")}
            </TableHead>
            {!compact && <TableHead className={thClass}>{t("table.keywords")}</TableHead>}
            <TableHead className={thClass}>{t("table.priority")}</TableHead>
            <TableHead className={thClass}>{t("table.status")}</TableHead>
            {!compact && <TableHead className={thClass}>{t("table.updatedAt")}</TableHead>}
            <TableHead className="w-10 px-0">
              <span className="sr-only">{t("table.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
                {t("table.loading")}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-destructive">{t("table.error")}</p>
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    {t("common:actions.retry")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
                {t("table.empty")}
              </TableCell>
            </TableRow>
          )}

          {!isError && items.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onEdit(item)}
              className={`cursor-pointer border-b border-black/5 dark:border-white/10 ${
                activeId === item.id ? "bg-muted hover:bg-muted" : "hover:bg-accent/50"
              }`}
            >
              <TableCell className={`${tdClass} w-9 pl-0`} onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => onToggleSelect(item.id)}
                  aria-label={`Select ${item.title}`}
                  className={`mt-0.5 ${checkboxClass}`}
                />
              </TableCell>

              <TableCell className={`${tdClass} max-w-[280px] whitespace-normal pl-0`}>
                <p className="font-medium leading-snug text-foreground">{item.title}</p>
                <p className="truncate text-[13px] text-normal">{truncate(item.description)}</p>
              </TableCell>

              <TableCell className={`${tdClass} whitespace-nowrap`}>
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                  <span
                    className="size-[7px] rounded-sm"
                    style={{ backgroundColor: categoryDot(item.category) }}
                  />
                  {item.category}
                </p>
                <p className="mt-0.5 max-w-[170px] truncate font-mono text-xs text-muted-foreground">
                  {item.intentKey}
                </p>
              </TableCell>

              {!compact && (
              <TableCell className={`${tdClass} whitespace-nowrap`}>
                {item.keywords.slice(0, 1).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-muted px-2 py-0.5 text-[13px] text-foreground"
                  >
                    {keyword}
                  </span>
                ))}
                {item.keywords.length > 1 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    +{item.keywords.length - 1}
                  </span>
                )}
              </TableCell>
              )}

              <TableCell className={`${tdClass} whitespace-nowrap`}>
                <div className="flex items-center gap-2">
                  <span className="w-5 font-medium tabular-nums text-foreground">{item.priority}</span>
                  <span className="h-1 w-12 overflow-hidden rounded-sm bg-muted">
                    <span
                      className="block h-1 bg-primary"
                      style={{ width: `${Math.min(100, Math.max(0, item.priority))}%` }}
                    />
                  </span>
                </div>
              </TableCell>

              <TableCell className={`${tdClass} whitespace-nowrap`}>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-normal">
                  <span
                    className={`size-1.5 rounded-full ${item.active ? "bg-[#16a34a]" : "bg-[#a8a29e]"}`}
                  />
                  {item.active ? t("table.active") : t("table.inactive")}
                </span>
              </TableCell>

              {!compact && (
                <TableCell className={`${tdClass} whitespace-nowrap text-[13px] text-muted-foreground`}>
                  {formatRelativeTime(item.updatedAt)}
                </TableCell>
              )}

              <TableCell className="w-10 px-0 py-2.5" onClick={(event) => event.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("table.moreActions")}
                      className="size-9 rounded-lg text-normal"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("table.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("table.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KnowledgeTable;

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import type { KnowledgeItem } from "../type/knowledge.type";

/** สีของ badge หมวดหมู่ ถ้าเจอหมวดใหม่จะวนใช้สีจากลิสต์แทนที่จะไม่มีสี */
const CATEGORY_TONES = [
  "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
];

const categoryTone = (category: string) => {
  const sum = [...category].reduce((total, char) => total + char.charCodeAt(0), 0);
  return CATEGORY_TONES[sum % CATEGORY_TONES.length];
};

const truncate = (text: string, max = 34) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

type Props = {
  items: KnowledgeItem[];
  selectedIds: string[];
  /** ตอนเปิดการ์ดรายละเอียด ตารางเหลือที่น้อยลง จึงซ่อนคอลัมน์ที่สำคัญน้อยสุด */
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
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Intent Key</TableHead>
            <TableHead>Keywords</TableHead>
            {!compact && (
              <TableHead className="text-center whitespace-nowrap">Examples</TableHead>
            )}
            <TableHead className="text-center">Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={compact ? 9 : 10} className="py-10 text-center text-sm text-mini">
                Loading knowledge entries...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && isError && (
            <TableRow>
              <TableCell colSpan={compact ? 9 : 10} className="py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-destructive">โหลด Answer Patterns ไม่สำเร็จ</p>
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    ลองอีกครั้ง
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={compact ? 9 : 10} className="py-10 text-center text-sm text-mini">
                ไม่พบ entry ที่ตรงกับเงื่อนไข
              </TableCell>
            </TableRow>
          )}

          {!isError && items.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onEdit(item)}
              className={`cursor-pointer ${activeId === item.id ? "bg-hover" : ""}`}
            >
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => onToggleSelect(item.id)}
                  aria-label={`Select ${item.title}`}
                />
              </TableCell>

              <TableCell>
                <p className="text-sm font-medium text-normal">{item.title}</p>
                <p className="text-xs text-mini">{truncate(item.description)}</p>
              </TableCell>

              <TableCell>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryTone(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
              </TableCell>

              <TableCell className="max-w-[150px] truncate text-xs text-normal">
                {item.intentKey}
              </TableCell>

              <TableCell>
                <div className="flex flex-nowrap items-center gap-1">
                  {item.keywords.slice(0, 1).map((keyword) => (
                    <span
                      key={keyword}
                      className="whitespace-nowrap rounded-md bg-hover px-1.5 py-0.5 text-xs text-normal"
                    >
                      {keyword}
                    </span>
                  ))}
                  {item.keywords.length > 1 && (
                    <span className="text-xs text-mini">
                      +{item.keywords.length - 1}
                    </span>
                  )}
                </div>
              </TableCell>

              {!compact && (
                <TableCell className="text-center text-sm text-normal">
                  {item.questionExamples.length}
                </TableCell>
              )}

              <TableCell className="text-center text-sm text-normal">
                {item.priority}
              </TableCell>

              <TableCell>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    item.active
                      ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300"
                  }`}
                >
                  {item.active ? "Active" : "Inactive"}
                </span>
              </TableCell>

              <TableCell className="whitespace-nowrap text-xs text-mini">
                {formatRelativeTime(item.updatedAt)}
              </TableCell>

              <TableCell onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="More actions">
                        <MoreVertical className="h-4 w-4 text-mini" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KnowledgeTable;

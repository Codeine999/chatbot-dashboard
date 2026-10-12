import { useTranslation } from "react-i18next";
import { MessageSquareText, MoreHorizontal, Phone, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatTime } from "@/i18n/format";
import { LineMark, PlanBadge, StatusBadge, UserAvatar } from "./UserVisuals";
import type { RegisteredUser } from "../type";

const COLUMN_COUNT = 8;

/**
 * วันที่บรรทัดบน เวลาบรรทัดล่าง ใช้ทั้งคอลัมน์ Joined และ Last Active
 * ค่าว่างเกิดได้จริง เช่น สมาชิกที่ยังไม่เคยคุยผ่าน LINE จึงแสดงขีดแทน
 */
export const DateTimeCell = ({ iso }: { iso?: string | null }) => {
  if (!iso) return <span className="text-sm text-mini">-</span>;

  return (
    <div className="whitespace-nowrap">
      <p className="text-sm text-normal">{formatDate(iso)}</p>
      <p className="text-xs text-mini">{formatTime(iso)}</p>
    </div>
  );
};

export const RowActions = ({
  onEdit,
  onMessage,
  onDelete,
  label,
}: {
  onEdit: () => void;
  onMessage: () => void;
  onDelete: () => void;
  label: string;
}) => {
  const { t } = useTranslation("users");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label}>
          <MoreHorizontal className="size-4 text-mini" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onMessage}>
          <MessageSquareText className="mr-2 size-4" />
          {t("actions.message")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <SquarePen className="mr-2 size-4" />
          {t("actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 size-4" />
          {t("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const TableStateRow = ({
  columnCount,
  children,
}: {
  columnCount: number;
  children: React.ReactNode;
}) => (
  <TableRow className="hover:bg-transparent">
    <TableCell colSpan={columnCount} className="py-14 text-center">
      {children}
    </TableCell>
  </TableRow>
);

const LoadingRows = ({ columnCount }: { columnCount: number }) => (
  <>
    {Array.from({ length: 8 }, (_, row) => (
      <TableRow key={row} className="hover:bg-transparent">
        {Array.from({ length: columnCount }, (_, column) => (
          <TableCell key={column} className="py-3.5">
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

type Props = {
  users: RegisteredUser[];
  selectedIds: string[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (user: RegisteredUser) => void;
  onMessage: (user: RegisteredUser) => void;
  onDelete: (user: RegisteredUser) => void;
};

const UserTable = ({
  users,
  selectedIds,
  isLoading,
  isError,
  onRetry,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onMessage,
  onDelete,
}: Props) => {
  const { t } = useTranslation("users");
  const allSelected = users.length > 0 && selectedIds.length === users.length;

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 pl-4">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label={t("table.selectAll")}
              />
            </TableHead>
            <TableHead>{t("table.user")}</TableHead>
            <TableHead>{t("table.contact")}</TableHead>
            <TableHead>{t("table.plan")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead>{t("table.joined")}</TableHead>
            <TableHead>{t("table.lastActive")}</TableHead>
            <TableHead className="w-20 pr-4 text-right">{t("table.action")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && <LoadingRows columnCount={COLUMN_COUNT} />}

          {!isLoading && isError && (
            <TableStateRow columnCount={COLUMN_COUNT}>
              <p className="text-sm text-destructive">{t("loadFailed")}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                {t("common:actions.retry")}
              </Button>
            </TableStateRow>
          )}

          {!isLoading && !isError && users.length === 0 && (
            <TableStateRow columnCount={COLUMN_COUNT}>
              <p className="text-sm text-mini">{t("empty")}</p>
            </TableStateRow>
          )}

          {!isLoading && !isError && users.map((user) => (
            <TableRow key={user.id} className="[&>td]:py-4">
              <TableCell className="pl-4">
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={() => onToggleSelect(user.id)}
                  aria-label={t("table.selectOne", { name: user.name })}
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} src={user.avatar} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-normal">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-mini">@{user.username}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm text-normal">
                  <Phone className="size-3.5 shrink-0 text-mini" />
                  {user.phone ?? <span className="text-mini">-</span>}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-normal">
                  <LineMark />
                  {/* โชว์ชื่อที่แสดงบน LINE เท่านั้น userId ดิบไม่มีประโยชน์กับแอดมิน */}
                  <span className="truncate">
                    {user.lineName ?? <span className="text-mini">-</span>}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                {user.plan ? (
                  <PlanBadge plan={user.plan} />
                ) : (
                  <span className="text-sm text-mini">-</span>
                )}
              </TableCell>

              <TableCell>
                <StatusBadge status={user.status} />
              </TableCell>

              <TableCell>
                <DateTimeCell iso={user.joinedAt} />
              </TableCell>

              <TableCell>
                <DateTimeCell iso={user.lastActiveAt} />
              </TableCell>

              <TableCell className="pr-4 text-right">
                <RowActions
                  label={t("table.moreActions", { name: user.name })}
                  onEdit={() => onEdit(user)}
                  onMessage={() => onMessage(user)}
                  onDelete={() => onDelete(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;

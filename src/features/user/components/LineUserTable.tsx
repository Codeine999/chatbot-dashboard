import { useTranslation } from "react-i18next";
import { MessageSquareText, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/i18n/format";
import { DateTimeCell, TableStateRow } from "./UserTable";
import { UserAvatar } from "./UserVisuals";
import { Skeleton } from "@/components/ui/skeleton";
import type { LineUser } from "../type";

const COLUMN_COUNT = 5;

type Props = {
  users: LineUser[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onMessage: (user: LineUser) => void;
  onRegister: (user: LineUser) => void;
};

const LineUserTable = ({
  users,
  isLoading,
  isError,
  onRetry,
  onMessage,
  onRegister,
}: Props) => {
  const { t } = useTranslation("users");

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">{t("table.user")}</TableHead>
            <TableHead className="text-center">{t("table.messages")}</TableHead>
            <TableHead>{t("table.firstSeen")}</TableHead>
            <TableHead>{t("table.lastActive")}</TableHead>
            <TableHead className="w-20 pr-4 text-right">{t("table.action")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 8 }, (_, row) => (
              <TableRow key={row} className="hover:bg-transparent">
                {Array.from({ length: COLUMN_COUNT }, (_, column) => (
                  <TableCell key={column} className="py-3.5">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

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
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.displayName} src={user.avatar} />
                  {/* LINE userId เป็นรหัสยาวอ่านไม่รู้เรื่อง แสดงแค่ชื่อที่ผู้ใช้ตั้งไว้ */}
                  <p className="min-w-0 truncate text-sm font-semibold text-normal">
                    {user.displayName}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-center text-sm text-normal">
                {formatNumber(user.messageCount)}
              </TableCell>

              <TableCell>
                <DateTimeCell iso={user.firstSeenAt} />
              </TableCell>

              <TableCell>
                <DateTimeCell iso={user.lastActiveAt} />
              </TableCell>

              <TableCell className="pr-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("table.moreActions", { name: user.displayName })}
                    >
                      <MoreHorizontal className="size-4 text-mini" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onMessage(user)}>
                      <MessageSquareText className="mr-2 size-4" />
                      {t("actions.message")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRegister(user)}>
                      <UserPlus className="mr-2 size-4" />
                      {t("actions.register")}
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

export default LineUserTable;

import { useTranslation } from "react-i18next";
import { MessageSquareText, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber, formatTime } from "@/i18n/format";
import { UserAvatar } from "./UserVisuals";
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

/** วันที่บรรทัดเดียวกัน เวลาเป็นตัวอักษร mono สีจาง ตามดีไซน์ */
const DateCell = ({ iso }: { iso?: string | null }) => {
  if (!iso) return <span className="text-[13px] text-mini">-</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="text-[13px] text-normal">{formatDate(iso)}</span>{" "}
      <span className="font-mono text-xs text-mini">{formatTime(iso)}</span>
    </span>
  );
};

const LineUserTable = ({ users, isLoading, isError, onRetry, onMessage, onRegister }: Props) => {
  const { t } = useTranslation("users");
  const maxMessages = Math.max(1, ...users.map((user) => user.messageCount));
  const cellClass = "border-b border-border/60 px-3 py-3";

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-mini">
            <th scope="col" className="border-b border-border px-0 py-3 font-medium">{t("table.user")}</th>
            <th scope="col" className="border-b border-border px-3 py-3 font-medium">{t("table.messages")}</th>
            <th scope="col" className="border-b border-border px-3 py-3 font-medium">{t("table.firstSeen")}</th>
            <th scope="col" className="border-b border-border px-3 py-3 font-medium">{t("table.lastActive")}</th>
            <th scope="col" className="w-10 border-b border-border px-0 py-3">
              <span className="sr-only">{t("table.action")}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading &&
            Array.from({ length: 6 }, (_, row) => (
              <tr key={row}>
                {Array.from({ length: COLUMN_COUNT }, (_, column) => (
                  <td key={column} className={cellClass}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && isError && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="py-14 text-center">
                <p className="text-sm text-destructive">{t("loadFailed")}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                  {t("common:actions.retry")}
                </Button>
              </td>
            </tr>
          )}

          {!isLoading && !isError && users.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="py-14 text-center text-sm text-mini">
                {t("empty")}
              </td>
            </tr>
          )}

          {!isLoading &&
            !isError &&
            users.map((user) => {
              const barWidth = Math.round((user.messageCount / maxMessages) * 100);
              return (
                <tr key={user.id} className="transition-colors hover:bg-muted/50">
                  <td className={`${cellClass} pl-0`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="relative shrink-0">
                        <UserAvatar name={user.displayName} src={user.avatar} className="size-9" />
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[#06c755] ring-2 ring-background" />
                      </span>
                      <span className="flex min-w-0 flex-col leading-snug">
                        {/* LINE userId เป็นรหัสยาวอ่านไม่รู้เรื่อง แสดงแค่ชื่อที่ผู้ใช้ตั้งไว้ */}
                        <span className="truncate font-medium text-normal">{user.displayName}</span>
                        <span className="text-xs text-mini">LINE</span>
                      </span>
                    </div>
                  </td>

                  <td className={cellClass}>
                    <div className="flex items-center gap-2.5 whitespace-nowrap">
                      <span className="w-6 text-right font-medium tabular-nums text-normal">
                        {formatNumber(user.messageCount)}
                      </span>
                      <span className="h-1 w-18 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-[#2563eb]"
                          style={{ width: `${barWidth}%`, minWidth: user.messageCount > 0 ? 2 : 0 }}
                        />
                      </span>
                    </div>
                  </td>

                  <td className={cellClass}>
                    <DateCell iso={user.firstSeenAt} />
                  </td>

                  <td className={cellClass}>
                    <DateCell iso={user.lastActiveAt} />
                  </td>

                  <td className={`${cellClass} pr-0 text-right`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 text-mini"
                          aria-label={t("table.moreActions", { name: user.displayName })}
                        >
                          <MoreHorizontal className="size-4" />
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
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default LineUserTable;

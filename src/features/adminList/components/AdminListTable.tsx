import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/features/user/components/UserVisuals";
import type { AdminAccount, AdminRole } from "../type";

const COLUMN_COUNT = 5;

/** dev = สิทธิ์สูงสุด ไล่ลงมา owner และ admin สีจึงไล่จากเข้มไปอ่อน */
const ROLE_TONES: Record<string, string> = {
  dev: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  owner: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  admin: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
};

export const RoleBadge = ({ role }: { role: AdminRole }) => {
  const { t } = useTranslation("admins");

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        ROLE_TONES[role] ?? ROLE_TONES.admin
      )}
    >
      {t(`role.${role}`, { defaultValue: role })}
    </span>
  );
};

const AiAccessBadge = ({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation("admins");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        enabled
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300"
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", enabled ? "bg-emerald-500" : "bg-slate-400")}
      />
      {enabled ? t("ai.on") : t("ai.off")}
    </span>
  );
};

type Props = {
  admins: AdminAccount[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export const AdminListTable = ({
  admins,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: Props) => {
  const { t } = useTranslation("admins");

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">{t("table.admin")}</TableHead>
            <TableHead>{t("table.contact")}</TableHead>
            <TableHead>{t("table.role")}</TableHead>
            <TableHead>{t("table.aiAccess")}</TableHead>
            <TableHead className="pr-4">{t("table.joined")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }, (_, row) => (
              <TableRow key={row} className="hover:bg-transparent">
                {Array.from({ length: COLUMN_COUNT }, (_, column) => (
                  <TableCell key={column} className="py-3.5">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && isError && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMN_COUNT} className="py-14 text-center">
                <p className="text-sm text-destructive">
                  {errorMessage ?? t("loadFailed")}
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                  {t("common:actions.retry")}
                </Button>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && admins.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMN_COUNT}
                className="py-14 text-center text-sm text-mini"
              >
                {t("empty")}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="pl-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={`${admin.firstName} ${admin.lastName}`.trim() || admin.username}
                    src={admin.image ?? undefined}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-normal">
                      {`${admin.firstName} ${admin.lastName}`.trim() || admin.username}
                    </p>
                    <p className="truncate text-xs text-mini">@{admin.username}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2 text-sm text-normal">
                  <Mail className="size-3.5 shrink-0 text-mini" />
                  <span className="truncate">{admin.email}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-normal">
                  <Phone className="size-3.5 shrink-0 text-mini" />
                  {admin.phone || <span className="text-mini">-</span>}
                </div>
              </TableCell>

              <TableCell>
                <RoleBadge role={admin.role} />
              </TableCell>

              <TableCell>
                <AiAccessBadge enabled={admin.aiEnabled} />
              </TableCell>

              <TableCell className="pr-4 whitespace-nowrap text-sm text-mini">
                {formatDate(admin.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

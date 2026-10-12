import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
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
import { getApiErrorMessage } from "@/api/api";
import { formatNumber } from "@/i18n/format";
import { AdminListTable } from "./components/AdminListTable";
import { useAdminList } from "./hooks/useAdminList";
import { ADMIN_ROLES, type AdminListFilter } from "./type";

export const AdminList = () => {
  const { t } = useTranslation("admins");
  const { data, isPending, isError, error, refetch, isFetching } = useAdminList();

  const [filter, setFilter] = useState<AdminListFilter>({ search: "", role: "all" });

  const admins = useMemo(() => data ?? [], [data]);

  const visible = useMemo(() => {
    const keyword = filter.search.trim().toLowerCase();

    return admins.filter((admin) => {
      if (filter.role !== "all" && admin.role !== filter.role) return false;
      if (!keyword) return true;

      return [
        admin.username,
        admin.firstName,
        admin.lastName,
        admin.email,
        admin.phone,
      ].some((value) => value?.toLowerCase().includes(keyword));
    });
  }, [admins, filter]);

  return (
    <div className="mt-8 mb-12 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-normal">{t("title")}</h1>
            <p className="mt-0.5 text-sm text-mini">{t("subtitle")}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="!h-10 gap-2"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          {t("refresh")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 sm:w-1/2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mini" />
          <Input
            value={filter.search}
            onChange={(event) =>
              setFilter((current) => ({ ...current, search: event.target.value }))
            }
            placeholder={t("searchPlaceholder")}
            className="!h-11 bg-white pl-9 dark:bg-card"
          />
        </div>

        <Select
          value={filter.role}
          onValueChange={(value) =>
            setFilter((current) => ({
              ...current,
              role: value as AdminListFilter["role"],
            }))
          }
        >
          <SelectTrigger className="!h-11 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.allRoles")}</SelectItem>
            {ADMIN_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(`role.${role}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden bg-white p-0 dark:bg-card">
        <AdminListTable
          admins={visible}
          isLoading={isPending}
          isError={isError}
          errorMessage={isError ? getApiErrorMessage(error, t("loadFailed")) : undefined}
          onRetry={() => refetch()}
        />

        {!isPending && !isError && (
          <p className="border-t px-4 py-3 text-sm text-mini">
            {t("count", { count: visible.length, total: formatNumber(admins.length) })}
          </p>
        )}
      </Card>
    </div>
  );
};

export default AdminList;

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/api/api";
import { formatNumber } from "@/i18n/format";
import { AddAdminDialog } from "./components/AddAdminDialog";
import { AdminListTable } from "./components/AdminListTable";
import { useAdminList } from "./hooks/useAdminList";
import { ADMIN_ROLES, type AdminListFilter } from "./type";

export const AdminList = () => {
  const { t } = useTranslation("admins");
  const { data, isPending, isError, error, refetch } = useAdminList();

  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<AdminListFilter>({ search: "", role: "all" });

  const admins = useMemo(() => data ?? [], [data]);

  const roleTabs = [
    { value: "all", label: t("filter.all") },
    ...ADMIN_ROLES.map((role) => ({ value: role, label: t(`role.${role}`) })),
  ] satisfies { value: AdminListFilter["role"]; label: string }[];

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
    <PageContainer className="flex flex-col gap-5">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            {t("add.title")}
          </Button>
        }
      />

      {/* Filters */}
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

      <PillTabs
        tabs={roleTabs}
        value={filter.role}
        onChange={(role) => setFilter((current) => ({ ...current, role }))}
      />

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

      <AddAdminDialog open={addOpen} onOpenChange={setAddOpen} />
    </PageContainer>
  );
};

export default AdminList;

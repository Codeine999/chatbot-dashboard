import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserFilters } from "./components/UserFilters";
import { UserPagination } from "./components/UserPagination";
import { UserStatsCards } from "./components/UserStatsCards";
import { UserTabs } from "./components/UserTabs";
import UserTable from "./components/UserTable";
import LineUserTable from "./components/LineUserTable";
import {
  useLineUsers,
  useRegisteredUsers,
  useUserCounts,
} from "./hooks/useUsers";
import { LINE_SORTS, REGISTERED_SORTS } from "./type";
import type { UserListParams, UserTab } from "./type";

const PAGE_SIZE = 10;

const DEFAULT_PARAMS: UserListParams = {
  search: "",
  status: "all",
  sort: "newest",
  page: 1,
  pageSize: PAGE_SIZE,
};

const User = () => {
  const { t } = useTranslation("users");

  // เปิดหน้ามาที่แท็บผู้ใช้ LINE ที่ยังไม่สมัครก่อน เพราะเป็นกลุ่มที่แอดมินต้องตามต่อ
  const [tab, setTab] = useState<UserTab>("line");
  const [params, setParams] = useState<UserListParams>(DEFAULT_PARAMS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: counts, isLoading: isCountsLoading } = useUserCounts();

  // สองแท็บใช้ตัวกรองชุดเดียวกัน แต่ยิงคนละ query — enabled กันไม่ให้โหลดแท็บที่ไม่ได้ดู
  const registeredQuery = useRegisteredUsers(params, tab === "registered");
  const lineQuery = useLineUsers(params, tab === "line");
  const activeQuery = tab === "registered" ? registeredQuery : lineQuery;

  const page = activeQuery.data?.page ?? params.page;
  const total = activeQuery.data?.total ?? 0;

  const registeredUsers = useMemo(
    () => registeredQuery.data?.items ?? [],
    [registeredQuery.data]
  );

  /** แก้ตัวกรองเมื่อไหร่ ต้องกลับไปหน้าแรกเสมอ ไม่งั้นอาจค้างอยู่หน้าที่ไม่มีข้อมูลแล้ว */
  const patchParams = (patch: Partial<UserListParams>) =>
    setParams((current) => ({
      ...current,
      ...patch,
      page: "page" in patch ? (patch.page ?? 1) : 1,
    }));

  // ล้างที่เลือกไว้เมื่อเปลี่ยนแท็บหรือเปลี่ยนชุดข้อมูลที่เห็น
  useEffect(() => {
    setSelectedIds([]);
  }, [tab, params]);

  const handleTabChange = (next: UserTab) => {
    setTab(next);
    setParams({ ...DEFAULT_PARAMS });
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  const toggleSelectAll = () =>
    setSelectedIds((current) =>
      current.length === registeredUsers.length
        ? []
        : registeredUsers.map((user) => user.id)
    );

  return (
    <div className="mt-8 mb-12 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-normal">{t("title")}</h1>
          <p className="mt-1 text-sm text-mini">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="!h-11 gap-2 px-5">
            <Download className="size-4" />
            {t("common:actions.export")}
          </Button>

          <Button className="!h-11 gap-2 px-5">
            <Plus className="size-4" />
            {t("add")}
          </Button>
        </div>
      </div>

      <UserStatsCards counts={counts} isLoading={isCountsLoading} />

      <UserFilters
        params={params}
        showStatus={tab === "registered"}
        sorts={tab === "registered" ? REGISTERED_SORTS : LINE_SORTS}
        onChange={patchParams}
      />

      {/* พื้นขาวทึบ ไม่ใช้พื้นโปร่งของ Card เพื่อให้แถวในตารางอ่านง่าย */}
      <Card className="overflow-hidden bg-white p-0 dark:bg-card">
        {/* แท็บอยู่ในการ์ดเดียวกับตาราง จะได้อ่านว่ากำลังเลือกข้อมูลชุดไหนมาแสดง */}
        <UserTabs
          value={tab}
          counts={counts && { registered: counts.registered, line: counts.line }}
          className="px-4 pt-3"
          onChange={handleTabChange}
        />

        {tab === "registered" ? (
          <UserTable
            users={registeredUsers}
            selectedIds={selectedIds}
            isLoading={registeredQuery.isPending}
            isError={registeredQuery.isError}
            onRetry={() => registeredQuery.refetch()}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onEdit={() => {}}
            onMessage={() => {}}
            onDelete={() => {}}
          />
        ) : (
          <LineUserTable
            users={lineQuery.data?.items ?? []}
            isLoading={lineQuery.isPending}
            isError={lineQuery.isError}
            onRetry={() => lineQuery.refetch()}
            onMessage={() => {}}
            onRegister={() => {}}
          />
        )}

        <UserPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={(next) => patchParams({ page: next })}
        />
      </Card>
    </div>
  );
};

export default User;

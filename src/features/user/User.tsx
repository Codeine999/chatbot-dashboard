import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/common/PageContainer";
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
    <PageContainer className="mx-auto flex w-full max-w-[1320px] flex-col pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-sm text-muted-foreground">{t("title")}</p>
          <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.2] tracking-[-0.025em] text-foreground">
            {t("subtitle")}
          </h1>
        </header>

        <div className="flex gap-2">
          <Button variant="outline" className="h-10 gap-2 rounded-[10px] px-3.5 text-sm font-medium shadow-none">
            <Download className="size-[15px]" />
            {t("common:actions.export")}
          </Button>

          <Button className="h-10 gap-2 rounded-[10px] bg-primary pl-3.5 pr-4 text-sm font-medium text-primary-foreground shadow-none hover:bg-primary/85">
            <Plus className="size-[15px]" />
            {t("add")}
          </Button>
        </div>
      </div>

      <UserStatsCards
        counts={counts}
        lineUsers={lineQuery.data?.items ?? []}
        isLoading={isCountsLoading}
      />

      {/* แท็บคั่นด้วยเส้นล่าง ไม่มีกรอบการ์ด ตามดีไซน์ */}
      <div className="mt-11">
        <UserTabs
          value={tab}
          counts={counts && { registered: counts.registered, line: counts.line }}
          onChange={handleTabChange}
        />
      </div>

      <UserFilters
        params={params}
        showStatus={tab === "registered"}
        sorts={tab === "registered" ? REGISTERED_SORTS : LINE_SORTS}
        onChange={patchParams}
      />

      <div className="mt-2">
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
      </div>
    </PageContainer>
  );
};

export default User;

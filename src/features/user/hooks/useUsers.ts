import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userApi } from "../service/user.service";
import type { UserListParams } from "../type";

export const userKeys = {
  all: ["users"] as const,
  counts: () => [...userKeys.all, "counts"] as const,
  registered: (params: UserListParams) =>
    [...userKeys.all, "registered", params] as const,
  line: (params: UserListParams) => [...userKeys.all, "line", params] as const,
};

/** จำนวนบนแท็บ ไม่ขึ้นกับตัวกรอง จึงแยก query ออกมาไม่ให้โหลดใหม่ตอนพิมพ์ค้นหา */
export function useUserCounts() {
  return useQuery({
    queryKey: userKeys.counts(),
    queryFn: userApi.getCounts,
    staleTime: 60 * 1000,
  });
}

export function useRegisteredUsers(params: UserListParams, enabled = true) {
  return useQuery({
    queryKey: userKeys.registered(params),
    queryFn: () => userApi.listRegistered(params),
    enabled,
    // คงข้อมูลหน้าเดิมไว้ระหว่างเปลี่ยนหน้า ตารางจึงไม่กระพริบเป็นช่องว่าง
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useLineUsers(params: UserListParams, enabled = true) {
  return useQuery({
    queryKey: userKeys.line(params),
    queryFn: () => userApi.listLine(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

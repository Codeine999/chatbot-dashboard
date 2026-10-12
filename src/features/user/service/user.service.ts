import { api } from "@/api/api";
import { USER_STATUSES } from "../type";
import type {
  LineUser,
  Paginated,
  RegisteredUser,
  UserListParams,
  UserStatus,
  UserTabCounts,
} from "../type";

/** รูปแบบที่ backend ส่งกลับ ต่างจากชนิดที่ตารางใช้ตรงที่ status เป็น string ดิบ */
type RegisteredUserResponse = Omit<RegisteredUser, "status"> & {
  status: string;
};

const toStatus = (value: string): UserStatus => {
  const normalized = value.trim().toLowerCase();

  // statusaccount เป็น free text ฝั่ง DB ค่าที่ไม่รู้จักให้ตกเป็น inactive
  // จะได้ไม่ทำให้ badge พัง
  return USER_STATUSES.includes(normalized as UserStatus)
    ? (normalized as UserStatus)
    : "inactive";
};

/** ตัดค่าที่ไม่ได้กรองออกจาก query string ไม่ส่ง "all" หรือคำค้นว่างไปให้ backend */
const toQuery = (params: UserListParams) => {
  const search = params.search.trim();

  return {
    ...(search ? { search } : {}),
    ...(params.status !== "all" ? { status: params.status } : {}),
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  };
};

export const userApi = {
  getCounts: async (): Promise<UserTabCounts> => {
    const { data } = await api.get<UserTabCounts>("/users/counts");
    return data;
  },

  listRegistered: async (
    params: UserListParams
  ): Promise<Paginated<RegisteredUser>> => {
    const { data } = await api.get<Paginated<RegisteredUserResponse>>("/users", {
      params: toQuery(params),
    });

    return {
      ...data,
      items: data.items.map((user) => ({
        ...user,
        status: toStatus(user.status),
      })),
    };
  },

  listLine: async (params: UserListParams): Promise<Paginated<LineUser>> => {
    const { data } = await api.get<Paginated<LineUser>>("/users/line", {
      // แท็บนี้แสดงเฉพาะคนที่ยังไม่ได้ผูกกับสมาชิกที่สมัครแล้ว
      params: { ...toQuery(params), registered: "false" },
    });

    return data;
  },
};

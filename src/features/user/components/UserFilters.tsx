import { useTranslation } from "react-i18next";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_STATUSES } from "../type";
import type { UserListParams, UserSort } from "../type";

type Props = {
  params: UserListParams;
  /** แท็บ LINE ไม่มีสถานะบัญชีให้กรอง จึงซ่อนช่องนั้น */
  showStatus: boolean;
  /** ตัวเลือกการเรียงต่างกันตามแท็บ ส่งเฉพาะอันที่ backend เรียงให้ได้จริง */
  sorts: UserSort[];
  onChange: (patch: Partial<UserListParams>) => void;
};

/** ช่องค้นหาพื้นเทาไม่มีขอบ และปุ่มเรียงมีขอบ ตามดีไซน์ */
export const UserFilters = ({ params, showStatus, sorts, onChange }: Props) => {
  const { t } = useTranslation("users");

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mini" />
        <Input
          value={params.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="h-10 rounded-[10px] border-0 bg-muted pl-9 text-sm shadow-none focus-visible:ring-[3px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showStatus && (
          <Select
            value={params.status}
            onValueChange={(value) =>
              onChange({ status: value as UserListParams["status"] })
            }
          >
            <SelectTrigger className="h-10 w-40 rounded-[10px] text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
              {USER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={params.sort}
          onValueChange={(value) => onChange({ sort: value as UserSort })}
        >
          <SelectTrigger className="h-10 w-auto gap-2 rounded-[10px] px-3 text-[13px] text-normal shadow-none">
            <ArrowUpDown className="size-3.5 text-mini" />
            <span>{t("sortBy")}:</span>
            <span className="text-foreground">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {sorts.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {t(`sort.${sort}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

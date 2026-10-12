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

export const UserFilters = ({ params, showStatus, sorts, onChange }: Props) => {
  const { t } = useTranslation("users");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-0 lg:w-1/2">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mini" />
        <Input
          value={params.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder={t("searchPlaceholder")}
          className="!h-11 bg-white pl-9 dark:bg-card"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {showStatus && (
          <Select
            value={params.status}
            onValueChange={(value) =>
              onChange({ status: value as UserListParams["status"] })
            }
          >
            <SelectTrigger className="!h-11 w-40">
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
          <SelectTrigger className="!h-11 w-40">
            <ArrowUpDown className="size-4 text-mini" />
            <SelectValue />
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import {
  MessageSquareText,
  SquarePen,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { UserItem } from "../type";

type UserTableProps = {
  users: UserItem[];
  isLoading?: boolean;
};

const getUserId = (user: UserItem, index: number) => user.uuid ?? user.id ?? user._id ?? index;
const getFirstName = (user: UserItem) => user.firstName ?? user.firstname ?? user.first_name ?? user.name ?? "-";
const getLastName = (user: UserItem) => user.lastName ?? user.lastname ?? user.last_name ?? "-";
const getImage = (user: UserItem) => user.image ?? user.avatar ?? user.profileImage;
const getInitial = (user: UserItem) => (user.username ?? getFirstName(user)).charAt(0).toUpperCase() || "?";
const getStatus = (user: UserItem) => user.statusaccount ?? user.statusAccount ?? user.status ?? "-";

const UserTable = ({ users, isLoading = false }: UserTableProps) => {
  return (
    <Card className="mt-3 overflow-hidden">

      <Table className="min-w-[1100px] table-fixed">
        <TableHeader className="h-[55px]">
          <TableRow>
            <TableHead className="w-[90px] px-6 text-mini font-medium">
              Picture
            </TableHead>
            <TableHead className="w-[140px] px-4 text-mini font-medium">
              Username
            </TableHead>
            <TableHead className="w-[140px] px-6 text-mini font-medium">
              First Name
            </TableHead>
            <TableHead className="w-[140px] px-[6px] text-mini font-medium">
              Last Name
            </TableHead>
            <TableHead className="w-[130px] text-center text-mini font-medium">
              Phone
            </TableHead>
            <TableHead className="w-[150px] text-center text-mini font-medium">
              Bank
            </TableHead>
            <TableHead className="w-[150px] text-center text-mini font-medium">
              Bank No.
            </TableHead>
            <TableHead className="w-[120px] text-center text-mini font-medium">
              Status
            </TableHead>
            <TableHead className="w-[120px] text-center text-mini font-medium">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="lg:h-[600px] h-[550px] overflow-auto">
        <Table className="table-fixed">
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-mini">
                  Loading users...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-mini">
                  No users found
                </TableCell>
              </TableRow>
            )}

            {!isLoading && users.map((items, index) => (
              <TableRow key={getUserId(items, index)}>
                <TableCell className="w-[90px] px-6 py-2.5">
                  {getImage(items) ? (
                    <img
                      src={getImage(items)}
                      alt={items.username ?? "user"}
                      className="w-[34px] h-[34px] object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-[34px] h-[34px] rounded-full bg-muted flex items-center justify-center text-xs font-medium text-mini">
                      {getInitial(items)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="w-[140px] text-sm px-4 font-normal text-normal">
                  {items.username ?? "-"}
                </TableCell>
                <TableCell className="w-[140px] text-sm px-6 font-normal text-normal">
                  {getFirstName(items)}
                </TableCell>
                <TableCell className="w-[140px] text-sm text-left font-normal text-normal">
                  {getLastName(items)}
                </TableCell>
                <TableCell className="w-[130px] text-center font-normal text-normal">
                  {items.phone ?? "-"}
                </TableCell>
                <TableCell className="w-[150px] text-center font-normal text-normal">
                  {items.bankname ?? "-"}
                </TableCell>
                <TableCell className="w-[150px] text-center font-normal text-normal">
                  {items.banknumber ?? "-"}
                </TableCell>
                <TableCell className="w-[120px] text-center text-yellow-500 font-semibold capitalize">
                  {getStatus(items)}
                </TableCell>
                <TableCell className="w-[110px]">
                  <div className="flex justify-center items-center">

                    <Button variant="ghost" className="text-slate-400  -mx-2">
                      <MessageSquareText className="!w-4.5 !h-4.5" />
                    </Button>

                    <Button variant="ghost" className="text-yellow-500">
                      <SquarePen className="!w-4.5 !h-4.5" />
                    </Button>

                    <Button variant="ghost" className="text-red-400 -mx-2">
                      <Trash2 className="!w-4.5 !h-4.5" />
                    </Button>

                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default UserTable;

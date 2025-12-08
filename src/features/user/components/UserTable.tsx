import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ButtonAdd } from "@/components/Components";

import {
  MessageSquareText,
  SquarePen,
  Search,
  Download,
  Trash2,
  ChevronDown
}
  from "lucide-react";

import { users } from "@/data/users.data";
import { Card } from "@/components/ui/card";

const UserTable = () => {
  return (
    <Card className="mt-3 overflow-hidden">

      <Table className="min-w-[900px] table-fixed">
        <TableHeader className="h-[55px]">
          <TableRow>
            <TableHead className="w-[100px] px-6 text-mini font-medium">
              Picture
            </TableHead>
            <TableHead className="w-[150px] px-4 text-mini font-medium">
              Username
            </TableHead>
            <TableHead className="w-[150px] px-6 text-mini font-medium">
              First Name
            </TableHead>
            <TableHead className="w-[180px] px-[6px] text-mini font-medium">
              Email
            </TableHead>
            <TableHead className="w-[120px] text-center text-mini font-medium">
              Role
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
            {users.map((items, index) => (
              <TableRow key={index}>
                <TableCell className="w-[100px] px-6 py-2.5">
                  <img
                    src={items.image}
                    alt="img"
                    className="w-[34px] h-[34px] object-cover rounded-full"
                  />
                </TableCell>
                <TableCell className="w-[150px] text-sm px-4 font-normal text-normal">
                  {items.username}
                </TableCell>
                <TableCell className="w-[150px] text-sm px-6 font-normal text-normal">
                  {items.firstName}
                </TableCell>
                <TableCell className="w-[180px] text-sm text-left font-normal text-normal">
                  {items.email}
                </TableCell>
                <TableCell className="w-[130px] text-center font-normal text-normal">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="flex item-center gap-1 cursor-pointer">
                        User

                        <ChevronDown className="mt-1 w-4 h-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>User</DropdownMenuItem>
                      <DropdownMenuItem>Moderator</DropdownMenuItem>
                      <DropdownMenuItem>Admin</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="w-[120px] text-center text-yellow-500 font-semibold">
                  null
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

export default UserTable
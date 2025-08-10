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

import UserTable from "./components/UserTable";

const User = () => {
  return (
    <div className="mt-10 2xl:px-28 max-w-8xl mx-auto mb-12">
      <div className="flex justify-between items-center">
        <div className="px-4">
          <div className="flex gap-4 items-center">
            <Button variant="ghost">All</Button>
            <span className="text-normal text-sm">|</span>
            <Button variant="ghost">Admin</Button>
          </div>
        </div>
        <div>
          <ButtonAdd onClick={''} title="Add User +" />
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div>
          <div
            className="w-full h-[40px] bg-background border-1 rounded-lg
            focus-within:ring-1 focus-within:ring-[#9369db] transition"
          >
            <div className="flex px-3 items-center h-full">
              <Search className="mr-2 text-mini" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none w-full"
              // onChange={handleSearchChange}
              />
              <div
                className="ml-auto w-[32px] h-[22px]  border
               flex justify-center items-center rounded-sm"
              >
                <p className="text-xs text-[#879da7] p-1">
                  ⌘<span className="ml-[2px]">K</span>
                </p>
              </div>
            </div>
          </div>
        </div>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="border-2">
              <div className="flex items-center gap-1 text-[#879da7] ">
                Export
                <Download className="!w-4 !h-3.6" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <img
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                Excel
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <img
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                Excel
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <img
                  src="/icon/excel.png"
                  className="w-5 h-5"
                />
                Excel
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>

            </DropdownMenuGroup>
          </DropdownMenuContent>

        </DropdownMenu>


      </div>

      <UserTable />

    </div>
  );
};

export default User;

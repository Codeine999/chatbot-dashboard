import { useState } from "react";
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
  Search,
  Download,
} from "lucide-react";

import UserTable from "./components/UserTable";
import { useUsers } from "./hooks/useUsers";

const User = () => {
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading, isError } = useUsers();

  const keyword = search.trim().toLowerCase();
  const filteredUsers = keyword
    ? users.filter((user) =>
        [
          user.username,
          user.firstName,
          user.firstname,
          user.first_name,
          user.lastName,
          user.lastname,
          user.email,
          user.phone,
          user.bankname,
          user.banknumber,
          user.uuid,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))
      )
    : users;

  return (
    <div className="mt-10 2xl:px-28 max-w-8xl mx-auto mb-12">
      <div className="flex justify-between items-center">
        <div className="px-">
          {/* <div className="flex items-center">
            <Button variant="ghost">All</Button>
            <span className="text-normal text-sm">|</span>
            <Button variant="ghost">Admin</Button>
          </div> */}
        </div>
        <div>
          <ButtonAdd onClick={() => {}} title="Add User +" />
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
                value={search}
                className="bg-transparent outline-none w-full"
                onChange={(event) => setSearch(event.target.value)}
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

            </DropdownMenuGroup>
          </DropdownMenuContent>

        </DropdownMenu>
        
      </div>

      {isError && (
        <p className="mt-3 text-sm text-red-500">Failed to load users</p>
      )}

      <UserTable users={filteredUsers} isLoading={isLoading} />

    </div>
  );
};

export default User;

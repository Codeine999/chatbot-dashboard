import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"

import { LogOut, Moon, Sun, Settings, User, Bell, MailWarning } from "lucide-react";
import { useTheme } from "@/components/context/themeProvider";
import { SidebarTrigger } from "./ui/sidebar";
import Profile from "@/assets/profile.jpeg";

const notifications = [
  { id: 1, user: 'Service', action: 'You got some new order now', time: '5 mins ago', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, user: 'Service', action: 'You got some new order now', time: '21 mins ago', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, user: 'Dave Wood', action: 'You got some new order now ', time: '2hrs ago', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, user: 'Kate Young', action: 'Liked your photo: Daily UI Challenge 049', time: '3hrs ago', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 5, user: 'Anna Lee', action: 'You got some new order now', time: '1 day ago', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
];

const navbar = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    document.body.classList.remove(theme);
    document.body.classList.add(newTheme);
  };

  return (
    <nav className="p-2 pt-3 flex items-center justify-between">

      <div className="flex gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex items-center">
        <div className="flex md:gap-4 gap-2 md:mx-2">
          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <Button variant="nav">
                <div className="flex gap-1">
                  <Bell className="w-10 h-5" />
                  <p className="text-xs">+0</p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-74 h-[320px] bg-background rounded-lg shadow-lg flex 
                flex-col overflow-hidden"
            >

              <div className="p-2 px-4 sticky top-0">
                <p className="text-md text-mini font-medium">Notification</p>
              </div>

              <div className="overflow-y-auto px-1">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center space-x-3 py-1">
                    <DropdownMenuItem className="w-full">
                      <div
                        // src={notification.image}
                        // alt={notification.user}
                        className="-mt-2 w-8 h-8 bg-gray-300 rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="text-md text-mini font-medium">{notification.user}</span>
                        <span className="text-xs text-normal">{notification.action}</span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>

                    </DropdownMenuItem>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="nav" size="icon" onClick={toggleTheme}>
            <Sun className={`!w-10 !h-5 transition-all duration-300 
              ${theme === "dark" ? "rotate-0 scale-0" : "rotate-0 scale-100"}`}
            />
            <Moon
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 
                ${theme === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="mx-6">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={Profile} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl mx-4 p-2">
                <DropdownMenuLabel >My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="!w-5 !h-5 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="!w-5 !h-5 mr-2" />
                  Setting
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="!w-5 !h-5 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default navbar;

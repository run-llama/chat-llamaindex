import { ThemeToggle } from "@/app/components/layout/theme-toggle";
import { Linkedin, LogOut, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useNavigate } from "react-router-dom";
import { getClientConfig } from "../../config/client";
import { LINKEDIN_URL, Path } from "../../constant";
import Locale from "../../locales";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Typography from "../ui/typography";

const BotList = dynamic(async () => (await import("../bot/bot-list")).default, {
  loading: () => null,
});

export function SideBar(props: { className?: string }) {
  const { data: session } = useSession();
  const clientConfig = getClientConfig();
  const navigate = useNavigate();

  const dropdownItems = [
    {
      icon: <Settings className="mr-2 h-4 w-4" />,
      text: Locale.Home.Settings,
      action: () => {
        navigate(Path.Settings);
      },
    },
    {
      icon: <LogOut className="mr-2 h-4 w-4" />,
      text: Locale.Home.Logout,
      action: () => {
        signOut();
      },
    },
  ];

  const shortUsername = session?.user?.name!.substring(0, 2).toUpperCase();

  return (
    <div className="h-full relative group border-r w-[300px]">
      <div className="w-full h-full p-5 flex flex-col gap-5">
        <div className="flex flex-col flex-1">
          <div className="mb-5 flex justify-between gap-5 items-start">
            <div>
              <Typography.H1>{Locale.Welcome.Title}</Typography.H1>
              <div className="text-sm text-muted-foreground">
                {Locale.Welcome.SubTitle}
              </div>
            </div>
            <ThemeToggle />
          </div>
          <BotList />
        </div>

        <div className="flex items-center justify-between">
          {clientConfig.hasNextAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={session?.user?.image!} />
                  <AvatarFallback>{shortUsername}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dropdownItems.map((item) => (
                  <DropdownMenuItem key={item.text} onClick={item.action}>
                    {item.icon}
                    <span>{item.text}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                navigate(Path.Settings);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(LINKEDIN_URL, "_blank")}
          >
            <Linkedin className="mr-2 h-4 w-4" />
            <span>{Locale.Home.LinkedIn}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

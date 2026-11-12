"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CircleUser, EllipsisVertical, ExternalLink, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

export function NavUser({
  user,
}: {
  readonly user: {
    readonly id?: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore if supabase client fails
    }
    router.push("/auth/v2/login");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-border/50">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-[#c5a059]/15 text-[#c5a059] font-bold text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">{user.email}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-lg border border-border/50">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-[#c5a059]/15 text-[#c5a059] font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                  {user.role && (
                    <span className="text-[11px] font-medium text-[#c5a059] capitalize mt-0.5">{user.role}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex w-full items-center gap-2 cursor-pointer">
                  <CircleUser className="size-4" />
                  <span>Admin Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="size-4" />
                  <span>View Public Portal</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

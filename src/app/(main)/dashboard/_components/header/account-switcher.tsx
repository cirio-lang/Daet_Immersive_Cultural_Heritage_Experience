"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "cn";
import { Check, CircleUser, ExternalLink, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export function AccountSwitcher({ users }: { readonly users: ReadonlyArray<AccountUser> }) {
  const [activeUser, setActiveUser] = useState(users[0]);
  const router = useRouter();

  if (!activeUser) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore errors on sign out
    }
    router.push("/auth/v2/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none ring-offset-background transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open user profile menu"
        >
          <Avatar className="size-8 rounded-full border border-border/60">
            <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
            <AvatarFallback className="rounded-full bg-[#c5a059]/15 text-[#c5a059] font-bold text-xs">
              {getInitials(activeUser.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-64 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={8}>
        {/* Active user header card */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <Avatar className="size-9 rounded-full border border-border/50">
            <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
            <AvatarFallback className="rounded-full bg-[#c5a059]/15 text-[#c5a059] font-bold text-xs">
              {getInitials(activeUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeUser.name}</span>
            <span className="truncate text-muted-foreground text-xs">{activeUser.email}</span>
            {activeUser.role && (
              <span className="text-[11px] font-medium text-[#c5a059] capitalize mt-0.5">{activeUser.role}</span>
            )}
          </div>
        </div>

        {/* If multiple users exist, render quick switch list */}
        {users.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              Switch Account
            </div>
            {users.map((user) => (
              <DropdownMenuItem
                key={user.id}
                className={cn("cursor-pointer rounded-md px-2 py-1.5", user.id === activeUser.id && "bg-accent/60")}
                onClick={() => setActiveUser(user)}
              >
                <div className="flex w-full items-center gap-2">
                  <Avatar className="size-6 rounded-full">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="rounded-full bg-[#c5a059]/15 text-[#c5a059] font-bold text-[10px]">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-muted-foreground text-[10px]">{user.email}</span>
                  </div>
                  {user.id === activeUser.id && <Check className="size-3.5 text-[#c5a059]" />}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex w-full items-center gap-2 cursor-pointer">
              <CircleUser className="size-4" />
              <span>Admin Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/" target="_blank" rel="noreferrer" className="flex w-full items-center gap-2 cursor-pointer">
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
  );
}

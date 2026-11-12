import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { cn } from "cn";

import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { type DashboardUser, users as defaultUsers } from "@/data/users";
import { createClient } from "@/lib/supabase/server";
import { getPreference } from "@/server/server-actions";

import { AccountSwitcher } from "./_components/header/account-switcher";
import { LayoutControls } from "./_components/header/layout-controls";
import { SearchDialog } from "./_components/header/search-dialog";
import { ThemeSwitcher } from "./_components/header/theme-switcher";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const supabase = await createClient();

  const [variant, collapsible, siteContentRes, authUserRes, profilesRes] = await Promise.all([
    getPreference("sidebar_variant"),
    getPreference("sidebar_collapsible"),
    (async () => {
      try {
        const { data } = await supabase.from("site_content").select("logo_url").eq("id", "landing_page").single();
        return data?.logo_url ?? null;
      } catch {
        return null;
      }
    })(),
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        return user;
      } catch {
        return null;
      }
    })(),
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .order("created_at", { ascending: true });
        return data ?? [];
      } catch {
        return [];
      }
    })(),
  ]);

  const logoUrl = siteContentRes;
  const authUser = authUserRes;
  const profiles = profilesRes;

  let currentUser: DashboardUser = defaultUsers[0];
  let accountUsers: DashboardUser[] = [...defaultUsers];

  if (authUser) {
    const currentProfile = profiles.find((p) => p.id === authUser.id);
    const fullName =
      currentProfile?.full_name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "Daet Heritage Admin";
    const role = currentProfile?.role === "admin" ? "Administrator" : "Curator";
    const avatar =
      (authUser.user_metadata?.avatar_url as string | undefined) ||
      (currentProfile && "avatar_url" in currentProfile ? (currentProfile.avatar_url as string) : "") ||
      "";

    currentUser = {
      id: authUser.id,
      name: fullName,
      username: authUser.email?.split("@")[0] || "admin",
      email: authUser.email || "admin@daet.gov.ph",
      avatar,
      role,
    };

    if (profiles.length > 0) {
      accountUsers = profiles.map((p) => ({
        id: p.id,
        name: p.full_name || p.email.split("@")[0],
        username: p.email.split("@")[0],
        email: p.email,
        avatar: p.id === authUser.id ? avatar : "",
        role: p.role === "admin" ? "Administrator" : "Curator",
      }));

      if (!accountUsers.some((u) => u.id === currentUser.id)) {
        accountUsers.unshift(currentUser);
      }
    } else {
      accountUsers = [currentUser];
    }
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
        } as React.CSSProperties
      }
    >
      <AppSidebar logoUrl={logoUrl} user={currentUser} variant={variant} collapsible={collapsible} />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&>*]:mx-auto",
          "[html[data-content-layout=centered]_&>*]:w-full",
          "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
          "peer-data-[variant=inset]:border",
          "[--dashboard-header-height:--spacing(12)]",
          "min-w-0 overflow-x-clip",
        )}
      >
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
            "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
              />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <LayoutControls />
              <ThemeSwitcher />
              <AccountSwitcher users={accountUsers} />
            </div>
          </div>
        </header>
        {/* Pages can set data-content-padding="false" to render full-bleed app layouts. */}
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

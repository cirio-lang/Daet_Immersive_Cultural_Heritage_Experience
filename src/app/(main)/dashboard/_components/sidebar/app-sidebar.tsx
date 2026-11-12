"use client";

import * as React from "react";

import Link from "next/link";

import { Landmark } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { type DashboardUser, rootUser } from "@/data/users";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  logoUrl?: string | null;
  user?: DashboardUser;
}

export function AppSidebar({ logoUrl, user, ...props }: AppSidebarProps) {
  const [currentLogo, setCurrentLogo] = React.useState<string | null>(logoUrl ?? null);

  React.useEffect(() => {
    setCurrentLogo(logoUrl ?? null);
  }, [logoUrl]);

  React.useEffect(() => {
    const bc =
      typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("daet_heritage_sync") : null;

    if (bc) {
      bc.onmessage = (event) => {
        if (event.data?.type === "LOGO_UPDATED") {
          setCurrentLogo(event.data.logoUrl ?? null);
        }
      };
    }

    return () => {
      bc?.close();
    };
  }, []);

  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard">
                {currentLogo ? (
                  <img src={currentLogo} alt="Logo" className="size-4 shrink-0 rounded-xs object-contain" />
                ) : (
                  <Landmark className="size-4" />
                )}
                <span className="font-semibold text-base">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? rootUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

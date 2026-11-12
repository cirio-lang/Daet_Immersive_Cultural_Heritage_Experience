import { Landmark, LayoutDashboard, LayoutTemplate, type LucideIcon, UserRound } from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Curation & Exhibits",
    items: [
      {
        id: "overview",
        title: "Overview & Telemetry",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "heritage-sites",
        title: "Heritage Sites",
        url: "/dashboard/heritage-sites",
        icon: Landmark,
      },
      {
        id: "site-content",
        title: "Site Content",
        url: "/dashboard/site-content",
        icon: LayoutTemplate,
      },
    ],
  },
  {
    id: 2,
    label: "Account",
    items: [
      {
        id: "profile",
        title: "Admin Account",
        url: "/dashboard/profile",
        icon: UserRound,
      },
    ],
  },
];

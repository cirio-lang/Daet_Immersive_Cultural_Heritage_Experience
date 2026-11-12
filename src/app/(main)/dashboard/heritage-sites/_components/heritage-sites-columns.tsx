"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { Camera, ExternalLink, Eye, MapPin, MoreHorizontal, Pencil, QrCode, Trash2 } from "lucide-react";

import { HeritageImage } from "@/app/(external)/_components/heritage-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { CATEGORY_LABELS, type HeritageCategory, type HeritageSite } from "@/types/heritage";

export interface HeritageTableMeta {
  onEdit: (site: HeritageSite) => void;
  onDelete: (site: HeritageSite) => void;
  onPreview360: (site: HeritageSite) => void;
  onPreviewQR: (site: HeritageSite) => void;
  onTogglePublish: (site: HeritageSite, isPublished: boolean) => void;
}

export const heritageSitesColumns: ColumnDef<DataTableFeatures, HeritageSite>[] = [
  {
    accessorKey: "cover_image_url",
    header: "Cover",
    enableSorting: false,
    cell: ({ row }) => {
      const site = row.original;
      return (
        <div className="relative size-12 shrink-0 overflow-hidden rounded border border-border/80 bg-muted">
          <HeritageImage
            src={site.cover_image_url}
            alt={site.title}
            category={site.category}
            className="h-full w-full object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Heritage Landmark",
    cell: ({ row }) => {
      const site = row.original;
      return (
        <div className="flex flex-col max-w-xs">
          <span className="text-sm font-medium text-foreground line-clamp-1">{site.title}</span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <span>/sites/{site.slug}</span>
            {site.year_built && (
              <>
                <span>•</span>
                <span>Est. {site.year_built}</span>
              </>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as HeritageCategory;
      const label = CATEGORY_LABELS[category] || category;

      const getVariant = () => {
        switch (category) {
          case "monument":
            return "border-[#c5a059]/50 bg-[#c5a059]/10 text-[#c5a059]";
          case "religious":
            return "border-blue-500/40 bg-blue-500/10 text-blue-400";
          case "architectural":
            return "border-purple-500/40 bg-purple-500/10 text-purple-400";
          case "cultural":
            return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
          default:
            return "border-amber-500/40 bg-amber-500/10 text-amber-400";
        }
      };

      return (
        <span
          className={`inline-flex items-center rounded-none border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase ${getVariant()}`}
        >
          {label}
        </span>
      );
    },
  },
  {
    accessorKey: "barangay",
    header: "Barangay",
    cell: ({ row }) => {
      const barangay = row.getValue("barangay") as string;
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 text-[#c5a059]" />
          <span>{barangay}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "panorama_360_url",
    header: "360° View",
    cell: ({ row, table }) => {
      const site = row.original;
      const count = site.panoramas?.length ?? (site.panorama_360_url ? 1 : 0);
      const meta = table.options.meta as HeritageTableMeta | undefined;

      if (count > 0) {
        return (
          <Button
            variant="outline"
            size="xs"
            onClick={() => meta?.onPreview360(site)}
            className="h-6 gap-1.5 rounded border-emerald-500/40 bg-emerald-500/10 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20"
            title="Click to preview 360° panoramas"
          >
            <Eye className="size-3 text-emerald-400" />
            <span>
              {count} {count === 1 ? "Panorama" : "Panoramas"}
            </span>
          </Button>
        );
      }

      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-light text-muted-foreground">
          <Camera className="size-3 text-muted-foreground/60" />
          <span>No Panorama</span>
        </span>
      );
    },
  },
  {
    accessorKey: "is_published",
    header: "Status",
    cell: ({ row, table }) => {
      const site = row.original;
      const isPublished = Boolean(row.getValue("is_published"));
      const meta = table.options.meta as HeritageTableMeta | undefined;

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={isPublished}
            onCheckedChange={(checked) => meta?.onTogglePublish(site, checked)}
            aria-label="Toggle site publish status"
            suppressHydrationWarning={true}
          />
          <span
            className={`font-mono text-[10px] uppercase tracking-wider ${
              isPublished ? "text-emerald-400" : "text-muted-foreground"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      );
    },
  },
  {
    id: "qr_code",
    header: "Physical QR",
    cell: ({ row, table }) => {
      const site = row.original;
      const meta = table.options.meta as HeritageTableMeta | undefined;

      return (
        <Button
          variant="outline"
          size="xs"
          onClick={() => meta?.onPreviewQR(site)}
          className="h-6 gap-1 border-[#c5a059]/40 bg-[#c5a059]/5 text-[11px] text-[#c5a059] hover:bg-[#c5a059]/15"
          title="Generate and download printable QR code"
        >
          <QrCode className="size-3" />
          <span>QR Code</span>
        </Button>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const site = row.original;
      const meta = table.options.meta as HeritageTableMeta | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => meta?.onEdit(site)}>
              <Pencil className="mr-2 size-3.5" />
              <span>Edit Site</span>
            </DropdownMenuItem>

            {site.panorama_360_url && (
              <DropdownMenuItem onClick={() => meta?.onPreview360(site)}>
                <Eye className="mr-2 size-3.5" />
                <span>Preview 360° View</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => meta?.onPreviewQR(site)}>
              <QrCode className="mr-2 size-3.5" />
              <span>Generate QR Code</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/sites/${site.slug}`} target="_blank">
                <ExternalLink className="mr-2 size-3.5" />
                <span>View Public Page</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => meta?.onDelete(site)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-3.5" />
              <span>Delete Site</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

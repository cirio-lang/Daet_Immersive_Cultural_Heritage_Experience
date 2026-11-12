"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { type ColumnFiltersState, type PaginationState, type SortingState, useTable } from "@tanstack/react-table";
import {
  Camera,
  CheckCircle2,
  Eye,
  Globe,
  Landmark,
  LayoutTemplate,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { SiteQRDialog } from "@/components/qr/site-qr-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataTableFeatures } from "@/lib/data-table-features";
import { CATEGORY_LABELS, type HeritageCategory, type HeritageSite } from "@/types/heritage";

import { deleteHeritageSite, toggleSitePublish } from "../actions";
import { DeleteSiteDialog } from "./delete-site-dialog";
import { HeritageSiteFormDialog } from "./heritage-site-form-dialog";
import { type HeritageTableMeta, heritageSitesColumns } from "./heritage-sites-columns";
import { HeritageSitesTable } from "./heritage-sites-table";
import { PanoramaPreviewDialog } from "./panorama-preview-dialog";

interface HeritageSitesProps {
  initialSites: HeritageSite[];
}

export function HeritageSites({ initialSites }: HeritageSitesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sites, setSites] = React.useState<HeritageSite[]>(initialSites);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "title", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Dialog States
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingSite, setEditingSite] = React.useState<HeritageSite | null>(null);

  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      setEditingSite(null);
      setFormDialogOpen(true);
    }
  }, [searchParams]);

  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [qrSite, setQrSite] = React.useState<HeritageSite | null>(null);

  const [panoramaDialogOpen, setPanoramaDialogOpen] = React.useState(false);
  const [panoramaSite, setPanoramaSite] = React.useState<HeritageSite | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingSite, setDeletingSite] = React.useState<HeritageSite | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Sync with server updates
  React.useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  // Actions
  const handleEdit = (site: HeritageSite) => {
    setEditingSite(site);
    setFormDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingSite(null);
    setFormDialogOpen(true);
  };

  const handlePreviewQR = (site: HeritageSite) => {
    setQrSite(site);
    setQrDialogOpen(true);
  };

  const handlePreview360 = (site: HeritageSite) => {
    setPanoramaSite(site);
    setPanoramaDialogOpen(true);
  };

  const handleDeletePrompt = (site: HeritageSite) => {
    setDeletingSite(site);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSite) return;

    try {
      setIsDeleting(true);
      const res = await deleteHeritageSite(deletingSite.id, deletingSite.slug);
      if (!res.success) {
        toast.error(res.error || "Failed to delete site");
        return;
      }

      toast.success(`"${deletingSite.title}" deleted`);
      setSites((prev) => prev.filter((s) => s.id !== deletingSite.id));
      setDeleteDialogOpen(false);
      setDeletingSite(null);
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("daet_heritage_sync");
        bc.postMessage({ type: "SITES_UPDATED" });
        bc.close();
      }
      router.refresh();
    } catch (err: unknown) {
      console.error("Delete error:", err);
      toast.error("Failed to delete heritage site");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (site: HeritageSite, isPublished: boolean) => {
    // Optimistic update
    setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, is_published: isPublished } : s)));

    try {
      const res = await toggleSitePublish(site.id, isPublished, site.slug);
      if (!res.success) {
        // Revert on error
        setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, is_published: !isPublished } : s)));
        toast.error(res.error || "Failed to update publish state");
        return;
      }
      toast.success(`"${site.title}" is now ${isPublished ? "Published (Live)" : "Draft (Hidden)"}`);
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("daet_heritage_sync");
        bc.postMessage({ type: "SITES_UPDATED" });
        bc.close();
      }
      router.refresh();
    } catch {
      setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, is_published: !isPublished } : s)));
      toast.error("Network error while updating publish status");
    }
  };

  // TanStack table initialization
  const table = useTable({
    features: dataTableFeatures,
    data: sites,
    columns: heritageSitesColumns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    meta: {
      onEdit: handleEdit,
      onDelete: handleDeletePrompt,
      onPreview360: handlePreview360,
      onPreviewQR: handlePreviewQR,
      onTogglePublish: handleTogglePublish,
    } satisfies HeritageTableMeta,
  });

  // Filter queries
  const searchQuery = (table.getColumn("title")?.getFilterValue() as string | undefined) ?? "";
  const categoryFilter = (table.getColumn("category")?.getFilterValue() as string | undefined) ?? "all";

  // KPIs
  const totalCount = sites.length;
  const publishedCount = sites.filter((s) => s.is_published).length;
  const with360Count = sites.filter((s) => Boolean(s.panorama_360_url)).length;
  const pendingPhotosCount = sites.filter((s) => !s.cover_image_url).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Museum Curatorial Management Header & KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider">Total Landmarks</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">{totalCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground flex items-center gap-1">
            <Landmark className="size-3 text-[#c5a059]" />
            <span>Documented in Daet Registry</span>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider">Published Live</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-emerald-500 dark:text-emerald-400">
              {publishedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="size-3 text-emerald-400" />
            <span>Visible to public visitors on /</span>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider">
              360° Photogrammetry
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-[#c5a059]">{with360Count}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground flex items-center gap-1">
            <Eye className="size-3 text-[#c5a059]" />
            <span>Interactive 360° panoramic views active</span>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider">
              Field Documentation
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-amber-500 dark:text-amber-400">
              {pendingPhotosCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground flex items-center gap-1">
            <Camera className="size-3 text-amber-400" />
            <span>Pending student photo survey</span>
          </CardContent>
        </Card>
      </div>

      {/* Main TanStack Table Card */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 text-[#c5a059] mb-1">
              <Landmark className="size-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Municipal Catalogue Management</span>
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Heritage Sites Registry
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 max-w-xl">
              Create, update, and manage historical monuments, ecclesiastical landmarks, 360° panoramas, and printable
              QR codes for Daet.
            </CardDescription>
          </div>

          <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap items-center gap-2 md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end">
            {/* Search Input */}
            <InputGroup className="h-8 w-full md:w-56">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-8 text-xs"
                placeholder="Search landmarks..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("title")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </InputGroup>

            {/* Category Select Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                table.getColumn("category")?.setFilterValue(val === "all" ? undefined : val);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger size="sm" className="h-8 text-xs w-36">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Categories
                </SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                  <SelectItem key={catKey} value={catKey} className="text-xs">
                    {catLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => router.refresh()}
              title="Refresh table data"
            >
              <RefreshCw className="size-3.5" />
            </Button>

            {/* Site Content & Logo Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard/site-content">
                <LayoutTemplate className="size-3.5 text-[#c5a059]" />
                <span>Site Content &amp; Logo</span>
              </Link>
            </Button>

            {/* Add New Site Primary CTA */}
            <Button
              size="sm"
              onClick={handleAddNew}
              className="h-8 gap-1.5 bg-[#c5a059] text-black font-medium hover:bg-[#b08e4c] text-xs shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Add New Site</span>
            </Button>
          </CardAction>
        </CardHeader>

        {/* TanStack Table Render */}
        <HeritageSitesTable table={table} />
      </Card>

      {/* Add / Edit Form Modal */}
      <HeritageSiteFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        site={editingSite}
        onSuccess={() => router.refresh()}
      />

      {/* Printable QR Code Modal */}
      {qrSite && (
        <SiteQRDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          slug={qrSite.slug}
          title={qrSite.title}
          barangay={qrSite.barangay}
          category={CATEGORY_LABELS[qrSite.category]}
        />
      )}

      {/* 360° Photogrammetry Inspection Modal */}
      {panoramaSite && (
        <PanoramaPreviewDialog
          open={panoramaDialogOpen}
          onOpenChange={setPanoramaDialogOpen}
          panoramaUrl={panoramaSite.panorama_360_url}
          panoramas={panoramaSite.panoramas}
          siteTitle={panoramaSite.title}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <DeleteSiteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        site={deletingSite}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

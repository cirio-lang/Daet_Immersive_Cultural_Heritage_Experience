"use client";

import * as React from "react";

import { Eye, Layers } from "lucide-react";

import { PanoramaViewer } from "@/components/panorama/panorama-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { HeritagePanorama } from "@/types/heritage";

interface PanoramaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panoramaUrl?: string | null;
  panoramas?: HeritagePanorama[];
  siteTitle: string;
}

export function PanoramaPreviewDialog({
  open,
  onOpenChange,
  panoramaUrl,
  panoramas,
  siteTitle,
}: PanoramaPreviewDialogProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Compile available panoramas
  const viewList = React.useMemo(() => {
    if (panoramas && panoramas.length > 0) {
      return panoramas;
    }
    if (panoramaUrl) {
      return [{ id: "legacy-main", panorama_url: panoramaUrl, label: "Main View", sort_order: 0 }];
    }
    return [];
  }, [panoramas, panoramaUrl]);

  // Reset index on open or list change
  React.useEffect(() => {
    setActiveIndex(0);
  }, [open, panoramas, panoramaUrl]);

  const activePanorama = viewList[activeIndex] ?? null;
  const currentUrl = activePanorama?.panorama_url ?? null;
  const currentLabel = activePanorama?.label || "Main View";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[96vw] sm:max-w-[92vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl border-[#c5a059]/30 bg-card p-4 sm:p-6 shadow-2xl">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <Eye className="size-5" />
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                360° Inspection Theater: {siteTitle}
              </DialogTitle>
            </div>
            {viewList.length > 0 && (
              <Badge variant="outline" className="border-[#c5a059]/40 bg-[#c5a059]/10 text-xs text-[#e5c98b]">
                {viewList.length} {viewList.length === 1 ? "Perspective" : "Perspectives"} Available
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag with mouse or touch gestures to inspect the equirectangular panorama. Switch perspectives below if
            multiple angles are uploaded.
          </DialogDescription>
        </DialogHeader>

        {/* Perspective Selector when more than 1 panorama exists */}
        {viewList.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Layers className="size-3.5 text-[#c5a059]" />
              <span>Perspective:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {viewList.map((item, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <Button
                    key={item.id ?? idx}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="xs"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-7 px-3 text-xs transition-all ${
                      isSelected
                        ? "bg-[#c5a059] text-black font-semibold shadow-sm hover:bg-[#b08e48]"
                        : "hover:border-[#c5a059]/40 hover:text-foreground"
                    }`}
                  >
                    <span>{item.label || `View ${idx + 1}`}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative my-3 aspect-[21/9] sm:aspect-[2.2/1] w-full overflow-hidden border border-[#c5a059]/30 bg-black min-h-[460px]">
          <PanoramaViewer
            key={currentUrl || "empty"}
            panoramaUrl={currentUrl}
            siteTitle={`${siteTitle} - ${currentLabel}`}
            className="h-full w-full min-h-[460px]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            {currentUrl ? (
              <span className="font-mono text-[11px] text-emerald-400">
                Active Angle: <strong className="text-foreground">{currentLabel}</strong>
              </span>
            ) : (
              <span className="text-amber-400">No panorama attached to this perspective</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

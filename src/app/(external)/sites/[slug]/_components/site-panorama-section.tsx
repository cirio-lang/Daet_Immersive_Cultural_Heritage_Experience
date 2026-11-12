"use client";

import * as React from "react";

import { Eye, Layers } from "lucide-react";

import { PanoramaViewer } from "@/components/panorama/panorama-viewer";
import { Button } from "@/components/ui/button";
import type { HeritagePanorama } from "@/types/heritage";

interface SitePanoramaSectionProps {
  panoramas?: HeritagePanorama[];
  fallbackPanoramaUrl?: string | null;
  siteTitle: string;
}

export function SitePanoramaSection({ panoramas, fallbackPanoramaUrl, siteTitle }: SitePanoramaSectionProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const viewList = React.useMemo(() => {
    if (panoramas && panoramas.length > 0) {
      return panoramas;
    }
    if (fallbackPanoramaUrl) {
      return [
        {
          id: "default-main",
          panorama_url: fallbackPanoramaUrl,
          label: "Main View",
          sort_order: 0,
        },
      ];
    }
    return [];
  }, [panoramas, fallbackPanoramaUrl]);

  const activeItem = viewList[activeIndex] ?? null;
  const currentUrl = activeItem?.panorama_url ?? null;
  const currentLabel = activeItem?.label || "Panoramic Tour";

  return (
    <div id="panorama-section" className="scroll-mt-24 border border-[#c5a059]/25 bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-none border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059]">
            <Eye className="size-4" strokeWidth={1.25} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-normal text-foreground">360° Immersive Panoramic Experience</h2>
            <p className="text-xs font-light text-muted-foreground">
              Click and drag inside the viewport to explore the landmark in all directions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewList.length > 1 && (
            <span className="font-mono text-[10px] tracking-widest text-[#c5a059] uppercase border border-[#c5a059]/40 px-2 py-0.5">
              {viewList.length} Perspectives
            </span>
          )}
          <span className="font-mono text-[10px] tracking-widest text-[#c5a059] uppercase border border-[#c5a059]/40 px-2 py-0.5">
            Interactive
          </span>
        </div>
      </div>

      {/* Multiple Perspectives Navigation Tabs */}
      {viewList.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 border-y border-[#c5a059]/15 py-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase tracking-wider mr-1">
            <Layers className="size-3.5 text-[#c5a059]" />
            <span>Select Perspective:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {viewList.map((item, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <Button
                  key={item.id ?? idx}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-8 px-3.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#c5a059] text-black font-semibold shadow-xs hover:bg-[#b08e48]"
                      : "border-border/60 hover:border-[#c5a059]/50 hover:text-foreground"
                  }`}
                >
                  <span>{item.label || `Perspective ${idx + 1}`}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* 360 Photosphere Viewer Canvas */}
      <div className="relative aspect-video w-full overflow-hidden border border-[#c5a059]/20 bg-black min-h-[380px]">
        <PanoramaViewer
          key={currentUrl || "no-pano"}
          panoramaUrl={currentUrl}
          siteTitle={`${siteTitle} — ${currentLabel}`}
          className="h-full w-full min-h-[380px]"
        />
      </div>

      {/* Footnote / Current Active Label */}
      {currentUrl && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-light">
          <span className="font-mono text-[#c5a059]">
            Active Perspective: <strong className="text-foreground font-medium">{currentLabel}</strong>
          </span>
          <span className="hidden sm:inline">Use mouse drag or touch gesture to rotate 360°</span>
        </div>
      )}
    </div>
  );
}

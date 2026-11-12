"use client";

import * as React from "react";

import { ChevronLeft, ChevronRight, Download, ExternalLink, ImageIcon, Maximize2, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SiteGallerySectionProps {
  images: string[];
  siteTitle: string;
}

export function SiteGallerySection({ images, siteTitle }: SiteGallerySectionProps) {
  const [activeModalIndex, setActiveModalIndex] = React.useState<number | null>(null);

  // Filter out any empty strings
  const validImages = React.useMemo(() => {
    return images.filter((img) => typeof img === "string" && img.trim().length > 0);
  }, [images]);

  // Keyboard navigation when modal is open
  React.useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalIndex(null);
      } else if (e.key === "ArrowLeft") {
        setActiveModalIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : validImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveModalIndex((prev) => (prev !== null && prev < validImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex, validImages.length]);

  if (validImages.length === 0) {
    return null;
  }

  const activeImage = activeModalIndex !== null ? validImages[activeModalIndex] : null;

  return (
    <>
      <div id="gallery-section" className="scroll-mt-24 border border-[#c5a059]/25 bg-card p-6 sm:p-8 shadow-xs">
        {/* Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c5a059]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-none border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059]">
              <ImageIcon className="size-4" strokeWidth={1.25} />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
                Archival Photographic Gallery
              </h2>
              <p className="text-xs font-light text-muted-foreground mt-0.5">
                Supplementary architectural perspectives, exterior angles, and documentary plates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-[#c5a059] uppercase border border-[#c5a059]/40 px-2.5 py-0.5 bg-[#c5a059]/5">
              {validImages.length} {validImages.length === 1 ? "Plate" : "Plates"}
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {validImages.map((imageUrl, idx) => (
            <button
              key={`${imageUrl}-${idx}`}
              type="button"
              onClick={() => setActiveModalIndex(idx)}
              className="group relative aspect-4/3 w-full overflow-hidden rounded-none border border-border/80 bg-black/40 text-left transition-all duration-300 hover:border-[#c5a059] focus:outline-hidden focus:ring-2 focus:ring-[#c5a059]/60"
            >
              {/* Image element */}
              <img
                src={imageUrl}
                alt={`${siteTitle} - Photographic Plate ${idx + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradient Vignette & Hover Caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <span className="flex size-6 items-center justify-center rounded-none bg-black/70 text-[#c5a059] border border-[#c5a059]/40 backdrop-blur-xs">
                    <Maximize2 className="size-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider text-[#e5c98b] uppercase">
                    Plate {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-white/80 font-light">View Fullscreen</span>
                </div>
              </div>

              {/* Static Plate Tag (Always visible in bottom left corner) */}
              <div className="absolute bottom-2 left-2 group-hover:opacity-0 transition-opacity duration-200">
                <span className="bg-black/70 border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#e8d5b5] backdrop-blur-xs">
                  #{idx + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {activeModalIndex !== null && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalIndex(null)}
        >
          {/* Top Bar: Plate Title, Counter, Actions */}
          <div
            className="w-full flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#c5a059] border border-[#c5a059]/40 px-2 py-0.5">
                Plate {activeModalIndex + 1} of {validImages.length}
              </span>
              <span className="font-serif text-sm sm:text-base text-white/90 truncate max-w-[200px] sm:max-w-md">
                {siteTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/80 hover:text-white hover:bg-white/10 gap-1"
              >
                <a href={activeImage} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveModalIndex(null)}
                className="h-8 text-white/80 hover:text-white hover:bg-white/10"
                aria-label="Close Lightbox"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Main Photo View Area with Navigation Chevrons */}
          <div
            className="relative flex-1 w-full max-w-6xl my-auto flex items-center justify-center p-2 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Plate Button */}
            {validImages.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setActiveModalIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : validImages.length - 1))
                }
                className="absolute left-2 sm:left-4 z-10 size-10 rounded-none bg-black/60 border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="size-5" />
              </Button>
            )}

            {/* Expanded Image */}
            <div className="relative max-h-[70vh] sm:max-h-[78vh] max-w-full overflow-hidden border border-white/10 shadow-2xl bg-black/60 flex items-center justify-center">
              <img
                src={activeImage}
                alt={`${siteTitle} - Expanded Plate ${activeModalIndex + 1}`}
                className="max-h-[70vh] sm:max-h-[78vh] w-auto max-w-full object-contain select-none"
              />
            </div>

            {/* Next Plate Button */}
            {validImages.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setActiveModalIndex((prev) => (prev !== null && prev < validImages.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-2 sm:right-4 z-10 size-10 rounded-none bg-black/60 border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all"
                aria-label="Next Photo"
              >
                <ChevronRight className="size-5" />
              </Button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {validImages.length > 1 && (
            <div
              className="w-full max-w-4xl pt-3 border-t border-white/10 overflow-x-auto flex items-center justify-center gap-2 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((thumbUrl, tIdx) => (
                <button
                  key={`thumb-${thumbUrl}-${tIdx}`}
                  type="button"
                  onClick={() => setActiveModalIndex(tIdx)}
                  className={`relative size-12 sm:size-14 shrink-0 overflow-hidden border transition-all ${
                    activeModalIndex === tIdx
                      ? "border-[#c5a059] ring-2 ring-[#c5a059]/50 scale-105"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={thumbUrl} alt={`Thumbnail ${tIdx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

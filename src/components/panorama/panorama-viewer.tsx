"use client";

import dynamic from "next/dynamic";

import { Eye, Loader2 } from "lucide-react";

interface PanoramaViewerProps {
  panoramaUrl?: string | null;
  siteTitle?: string;
  className?: string;
  autoRotate?: boolean;
}

const PhotoSphereViewerClient = dynamic(
  () => import("./photo-sphere-viewer-impl").then((mod) => mod.PhotoSphereViewerImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center bg-black/90 p-8 text-center text-[#e5c98b]">
        <Loader2 className="size-8 animate-spin text-[#c5a059]" />
        <p className="mt-3 font-mono text-xs tracking-wider uppercase">Initializing 360° Photogrammetry Engine...</p>
      </div>
    ),
  },
);

export function PanoramaViewer({
  panoramaUrl,
  siteTitle = "360° Panoramic View",
  className = "h-full w-full",
  autoRotate = true,
}: PanoramaViewerProps) {
  // If no panorama is uploaded yet, render the museum curatorial fallback
  if (!panoramaUrl) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border border-[#c5a059]/20 bg-gradient-to-br from-[#162033] via-[#101726] to-[#080d17] p-8 text-center text-white">
        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        {/* Blueprint corner crosshairs */}
        <div className="pointer-events-none absolute top-3 left-3 font-mono text-xs text-[#c5a059]/40">+</div>
        <div className="pointer-events-none absolute top-3 right-3 font-mono text-xs text-[#c5a059]/40">+</div>
        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-xs text-[#c5a059]/40">+</div>
        <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-xs text-[#c5a059]/40">+</div>

        <div className="relative z-10 mb-4 flex size-16 items-center justify-center rounded-full border border-[#c5a059]/40 bg-[#080d17]/90 shadow-lg shadow-black/60">
          <Eye className="size-8 text-[#c5a059]" strokeWidth={1.25} />
        </div>
        <h4 className="relative z-10 font-serif text-lg font-normal text-[#faf7f2]">
          360° Photogrammetry Capture in Progress
        </h4>
        <p className="relative z-10 mt-2 max-w-md font-sans text-xs font-light leading-relaxed text-[#bbb1a2]">
          Field panoramic photography and equirectangular drone scans for this landmark are currently being documented
          by the Daet Heritage Research Team.
        </p>
        <div className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-none border border-[#c5a059]/40 bg-black/60 px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-[#e5c98b] uppercase backdrop-blur-xs">
          <span>Awaiting Equirectangular File</span>
        </div>
      </div>
    );
  }

  return (
    <PhotoSphereViewerClient
      panoramaUrl={panoramaUrl}
      siteTitle={siteTitle}
      className={className}
      autoRotate={autoRotate}
    />
  );
}

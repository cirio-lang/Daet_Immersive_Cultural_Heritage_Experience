"use client";

import { useState } from "react";

import { Camera, Church, Compass, Landmark, Sparkles } from "lucide-react";

import type { HeritageCategory } from "@/types/heritage";

interface HeritageImageProps {
  src?: string | null;
  alt: string;
  category?: HeritageCategory;
  className?: string;
}

export function HeritageImage({
  src,
  alt,
  category = "historical",
  className = "h-full w-full object-cover",
}: HeritageImageProps) {
  const [hasError, setHasError] = useState(false);

  // If we have a valid source and it hasn't errored, render the image
  if (src && !hasError) {
    return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setHasError(true)} />;
  }

  // Consistent museum archival placeholder treatment (when awaiting field documentation)
  const getCategoryIcon = () => {
    switch (category) {
      case "religious":
        return <Church className="size-8 text-[#c5a059]/70" strokeWidth={1.25} />;
      case "monument":
      case "historical":
        return <Landmark className="size-8 text-[#c5a059]/70" strokeWidth={1.25} />;
      default:
        return <Compass className="size-8 text-[#c5a059]/70" strokeWidth={1.25} />;
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border border-[#c5a059]/20 bg-gradient-to-br from-[#162033] via-[#101726] to-[#080d17] p-6 text-center">
      {/* Subtle Archival Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      {/* Crosshair marks in corners for architectural blueprint feel */}
      <div className="pointer-events-none absolute top-2 left-2 font-mono text-[9px] text-[#c5a059]/40">+</div>
      <div className="pointer-events-none absolute top-2 right-2 font-mono text-[9px] text-[#c5a059]/40">+</div>
      <div className="pointer-events-none absolute bottom-2 left-2 font-mono text-[9px] text-[#c5a059]/40">+</div>
      <div className="pointer-events-none absolute bottom-2 right-2 font-mono text-[9px] text-[#c5a059]/40">+</div>

      {/* Icon & Emblem */}
      <div className="relative z-10 mb-2.5 flex size-14 items-center justify-center rounded-full border border-[#c5a059]/30 bg-[#080d17]/80 backdrop-blur-xs">
        {getCategoryIcon()}
      </div>

      {/* Archival Plaque */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-medium tracking-[0.25em] text-[#e5c98b] uppercase">
          <Camera className="size-2.5 text-[#c5a059]" strokeWidth={1.5} />
          <span>Awaiting Field Photo</span>
        </span>
        <span className="mt-1 text-[10px] text-[#a89d8d] font-light tracking-wide">
          Student Documentation in Progress
        </span>
      </div>
    </div>
  );
}

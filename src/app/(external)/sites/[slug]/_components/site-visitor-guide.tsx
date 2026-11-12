"use client";

import { useState } from "react";

import { Compass, ExternalLink, Eye, ImageIcon, Navigation, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

import { SiteQRDialog } from "@/components/qr/site-qr-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SiteVisitorGuideProps {
  slug: string;
  title: string;
  barangay: string;
  category: string;
  municipality?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string | null;
  hasGallery?: boolean;
  galleryCount?: number;
}

export function SiteVisitorGuide({
  slug,
  title,
  barangay,
  category,
  municipality = "Daet",
  province = "Camarines Norte",
  latitude,
  longitude,
  logoUrl,
  hasGallery,
  galleryCount,
}: SiteVisitorGuideProps) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const cleanBrgy = barangay ? barangay.trim().replace(/^(barangay|brgy\.?)\s+/i, "") : "";

  // Turn-by-turn navigation via Google Maps
  const handleDirections = () => {
    let mapUrl = "";
    if (latitude && longitude) {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else {
      const destination = encodeURIComponent(`${title}, ${barangay}, ${municipality}, ${province}`);
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  // Mobile Native Share / Desktop Clipboard Copy
  const handleShare = async () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : `https://daet-heritage.ph/sites/${slug}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Daet Heritage`,
          text: `Explore ${title} in Daet, Camarines Norte with 360° virtual tour and historical archives.`,
          url: pageUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share aborted, ignore
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success("Landmark link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Smooth scroll to 360 viewer
  const handleScrollToPanorama = () => {
    const el = document.getElementById("panorama-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Smooth scroll to gallery
  const handleScrollToGallery = () => {
    const el = document.getElementById("gallery-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Card className="rounded-none border border-[#c5a059]/25 bg-card shadow-xs">
        <CardHeader className="border-b border-[#c5a059]/15 pb-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <Compass className="size-4" strokeWidth={1.5} />
              <CardTitle className="font-serif text-base font-normal text-foreground">Visitor Field Guide</CardTitle>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#c5a059] border border-[#c5a059]/30 bg-[#c5a059]/10 px-2 py-0.5">
              Daet Tourism
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-5 text-xs">
          {/* Action 1: Google Maps Navigation */}
          <Button
            onClick={handleDirections}
            className="w-full justify-between bg-[#c5a059] text-neutral-950 hover:bg-[#b08e4c] font-semibold text-xs h-10 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Navigation className="size-3.5 shrink-0" />
              <span>Get Directions in Google Maps</span>
            </div>
            <ExternalLink className="size-3 shrink-0 opacity-70" />
          </Button>

          {/* Action 2: Jump to 360 View */}
          <Button
            variant="outline"
            onClick={handleScrollToPanorama}
            className="w-full justify-start gap-2 border-border/60 hover:bg-muted/40 text-xs text-foreground h-9"
          >
            <Eye className="size-3.5 text-[#c5a059] shrink-0" />
            <span>Explore 360° Virtual Tour</span>
          </Button>

          {/* Action 2b: Jump to Gallery (if available) */}
          {hasGallery && (
            <Button
              variant="outline"
              onClick={handleScrollToGallery}
              className="w-full justify-between gap-2 border-border/60 hover:bg-muted/40 text-xs text-foreground h-9"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="size-3.5 text-[#c5a059] shrink-0" />
                <span>View Photo Gallery</span>
              </div>
              {galleryCount !== undefined && galleryCount > 0 && (
                <span className="font-mono text-[10px] text-[#c5a059] border border-[#c5a059]/30 bg-[#c5a059]/10 px-1.5 py-0.5">
                  {galleryCount} {galleryCount === 1 ? "plate" : "plates"}
                </span>
              )}
            </Button>
          )}

          {/* Action 3: Share Landmark */}
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full justify-start gap-2 border-border/60 hover:bg-muted/40 text-xs text-foreground h-9"
          >
            <Share2 className="size-3.5 text-[#c5a059] shrink-0" />
            <span>Share Landmark with Friends</span>
          </Button>

          {/* Action 4: Official Plaque Marker Modal (Replaces raw QR code box) */}
          <div className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              onClick={() => setQrDialogOpen(true)}
              className="w-full justify-between border-[#c5a059]/40 bg-[#c5a059]/5 hover:bg-[#c5a059]/15 text-xs text-foreground font-medium h-10"
            >
              <div className="flex items-center gap-2">
                <QrCode className="size-3.5 text-[#c5a059] shrink-0" />
                <span>View Official Physical Marker</span>
              </div>
              <span className="font-mono text-[9.5px] text-[#c5a059] uppercase tracking-wider font-semibold">
                Plaque & QR
              </span>
            </Button>
            <p className="mt-2 text-[11px] font-light leading-relaxed text-muted-foreground text-center">
              Official municipal plaque marker designed for on-site landmark pedestals.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Official Plaque Marker Dialog */}
      <SiteQRDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        slug={slug}
        title={title}
        barangay={cleanBrgy}
        category={category}
        logoUrl={logoUrl}
      />
    </>
  );
}

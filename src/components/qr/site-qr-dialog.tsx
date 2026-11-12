"use client";

import { useEffect, useRef, useState } from "react";

import { Check, Download, ExternalLink, Image as ImageIcon, MapPin, Palette, QrCode, Sparkles } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SiteQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  title: string;
  barangay?: string;
  category?: string;
  logoUrl?: string | null;
}

export function SiteQRDialog({ open, onOpenChange, slug, title, barangay, category, logoUrl }: SiteQRDialogProps) {
  const [origin, setOrigin] = useState("");
  const [plaqueTheme, setPlaqueTheme] = useState<"dark" | "light">("dark");
  const [safeQrLogo, setSafeQrLogo] = useState<string>("/images/logo/the-heritage-threshold-logo.png");
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      setOrigin(siteOrigin);
    }
  }, []);

  useEffect(() => {
    if (!logoUrl) {
      setSafeQrLogo("/images/logo/the-heritage-threshold-logo.png");
      return;
    }

    if (!logoUrl.startsWith("http://") && !logoUrl.startsWith("https://")) {
      setSafeQrLogo(logoUrl);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!isMounted) return;
      try {
        const testCanvas = document.createElement("canvas");
        testCanvas.width = img.naturalWidth || img.width || 160;
        testCanvas.height = img.naturalHeight || img.height || 160;
        const testCtx = testCanvas.getContext("2d");
        if (testCtx) {
          testCtx.drawImage(img, 0, 0);
          const dataUrl = testCanvas.toDataURL("image/png");
          setSafeQrLogo(dataUrl);
          return;
        }
      } catch {
        // Tainted canvas or CORS disallowed; safe fallback
      }
      setSafeQrLogo("/images/logo/the-heritage-threshold-logo.png");
    };
    img.onerror = () => {
      if (isMounted) {
        setSafeQrLogo("/images/logo/the-heritage-threshold-logo.png");
      }
    };
    img.src = logoUrl;

    return () => {
      isMounted = false;
    };
  }, [logoUrl]);

  const fullUrl = `${origin}/sites/${slug}?source=qr`;

  // Downloads complete museum / municipal physical plaque (1200 x 1680 px print-ready)
  const handleDownloadPlaque = () => {
    try {
      const qrCanvas = canvasRef.current?.querySelector("canvas");
      if (!qrCanvas) {
        toast.error("QR code marker is still preparing. Please try again.");
        return;
      }

      // Create high-resolution 1200 x 1600 canvas (proportional to preview card)
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Unable to initialize plaque canvas.");
        return;
      }

      const isDark = plaqueTheme === "dark";
      const goldColor = isDark ? "#c5a059" : "#a88038";
      const subTextColor = isDark ? "#a1a1aa" : "#71717a";
      const textColor = isDark ? "#ffffff" : "#18181b";

      // 1. Background
      if (isDark) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1600);
        bgGrad.addColorStop(0, "#19191c");
        bgGrad.addColorStop(0.5, "#121214");
        bgGrad.addColorStop(1, "#0a0a0c");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 1600);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1200, 1600);
      }

      // 2. Decorative Borders
      // Outer border
      ctx.strokeStyle = goldColor;
      ctx.lineWidth = 7;
      ctx.strokeRect(32, 32, 1136, 1536);

      // Inner border
      ctx.strokeStyle = isDark ? "rgba(197, 160, 89, 0.45)" : "rgba(168, 128, 56, 0.45)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(46, 46, 1108, 1508);

      // Decorative corner diamonds
      const drawDiamond = (cx: number, cy: number, size: number) => {
        ctx.fillStyle = goldColor;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size, cy);
        ctx.closePath();
        ctx.fill();
      };
      drawDiamond(39, 39, 7);
      drawDiamond(1161, 39, 7);
      drawDiamond(39, 1561, 7);
      drawDiamond(1161, 1561, 7);

      // 3. Header Section
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Plaque header title
      ctx.fillStyle = goldColor;
      ctx.font = "bold 36px 'Times New Roman', serif";
      ctx.fillText("DAET CULTURAL HERITAGE MARKER", 600, 105);

      // Subtitle
      ctx.fillStyle = subTextColor;
      ctx.font = "600 20px sans-serif";
      ctx.fillText("OFFICIAL ON-SITE GUIDE", 600, 145);

      // Divider line with center diamond
      ctx.strokeStyle = isDark ? "rgba(197, 160, 89, 0.5)" : "rgba(168, 128, 56, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(380, 180);
      ctx.lineTo(570, 180);
      ctx.moveTo(630, 180);
      ctx.lineTo(820, 180);
      ctx.stroke();
      drawDiamond(600, 180, 5);

      // 4. White Container Box for QR Code (880 x 880 to fill width proportionally like preview)
      const qrBoxX = 160;
      const qrBoxY = 215;
      const qrBoxSize = 880;
      const qrBoxRadius = 20;

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.08)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
      } else {
        ctx.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      }
      ctx.fill();
      ctx.restore();

      // Border around QR container
      ctx.strokeStyle = isDark ? "rgba(197, 160, 89, 0.6)" : "rgba(168, 128, 56, 0.6)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxRadius);
      } else {
        ctx.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      }
      ctx.stroke();

      // Draw QR Canvas (800 x 800 inside container)
      ctx.drawImage(qrCanvas, qrBoxX + 40, qrBoxY + 40, 800, 800);

      // 5. Scan Guide Pill Banner (matching QR Box width)
      const pillY = 1125;
      const pillWidth = 880;
      const pillHeight = 64;
      const pillX = 160;
      ctx.fillStyle = isDark ? "rgba(197, 160, 89, 0.18)" : "#fbf6ea";
      ctx.strokeStyle = goldColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 32);
      } else {
        ctx.rect(pillX, pillY, pillWidth, pillHeight);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? "#e5c07b" : "#8c6b23";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("SCAN TO EXPLORE 360° TOUR", 600, pillY + pillHeight / 2);

      // 6. Landmark Details
      ctx.fillStyle = textColor;
      ctx.font = "bold 52px 'Times New Roman', serif";
      const titleWords = title.split(" ");
      let currentLine = "";
      const titleLines: string[] = [];
      for (const w of titleWords) {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        if (ctx.measureText(testLine).width > 1000) {
          titleLines.push(currentLine);
          currentLine = w;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) titleLines.push(currentLine);

      let curY = titleLines.length > 1 ? 1230 : 1240;
      const titleLineHeight = 62;
      titleLines.forEach((tl) => {
        ctx.fillText(tl, 600, curY);
        curY += titleLineHeight;
      });

      // Location
      curY += 8;
      ctx.fillStyle = isDark ? "#d4d4d8" : "#52525b";
      ctx.font = "500 28px sans-serif";
      const cleanBrgy = barangay ? barangay.trim().replace(/^(barangay|brgy\.?)\s+/i, "") : "";
      const locText = cleanBrgy ? `Barangay ${cleanBrgy}, Daet` : "Daet, Camarines Norte";
      ctx.fillText(locText, 600, curY);

      // Category Tag
      if (category) {
        curY += 46;
        const catText = category.toUpperCase();
        ctx.font = "bold 18px monospace";
        const catMetrics = ctx.measureText(catText);
        const catBoxW = catMetrics.width + 48;
        const catBoxH = 40;
        const catBoxX = (1200 - catBoxW) / 2;

        ctx.fillStyle = isDark ? "rgba(197, 160, 89, 0.2)" : "rgba(168, 128, 56, 0.15)";
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(catBoxX, curY - catBoxH / 2, catBoxW, catBoxH, 8);
        } else {
          ctx.rect(catBoxX, curY - catBoxH / 2, catBoxW, catBoxH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = goldColor;
        ctx.fillText(catText, 600, curY);
      }

      // 7. Footer Institutional Marks
      ctx.strokeStyle = isDark ? "rgba(197, 160, 89, 0.35)" : "rgba(168, 128, 56, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(220, 1475);
      ctx.lineTo(980, 1475);
      ctx.stroke();

      ctx.fillStyle = isDark ? "#a1a1aa" : "#52525b";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("DAET IMMERSIVE CULTURAL HERITAGE", 600, 1512);

      ctx.fillStyle = isDark ? "#71717a" : "#78716c";
      ctx.font = "16px sans-serif";
      ctx.fillText("TOURISM & CULTURAL AFFAIRS OFFICE", 600, 1545);

      // Trigger high-res file download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `daet-heritage-plaque-${slug}-${plaqueTheme}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success(`High-resolution ${plaqueTheme === "dark" ? "Bronze" : "Classic Light"} plaque marker downloaded!`);
    } catch (err) {
      console.error("Plaque download error:", err);
      toast.error("Failed to generate plaque marker image");
    }
  };

  // Downloads standalone QR code (with center logo) for external design software
  const handleDownloadQROnly = () => {
    try {
      const canvas = canvasRef.current?.querySelector("canvas");
      if (!canvas) {
        toast.error("QR canvas not ready");
        return;
      }

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `daet-heritage-qr-only-${slug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success("Standalone QR code downloaded");
    } catch (err) {
      console.error("QR download error:", err);
      toast.error("Failed to download QR code");
    }
  };

  const isDarkPreview = plaqueTheme === "dark";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl border-[#c5a059]/30 bg-card p-5 sm:p-6 shadow-2xl">
        <DialogHeader className="border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5 text-[#c5a059]">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#c5a059]/10 text-[#c5a059]">
              <QrCode className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                Heritage Site Physical QR Plaque Marker
              </DialogTitle>
              <DialogDescription className="text-xs font-light text-muted-foreground mt-0.5">
                Print-ready physical marker designed for mounting on physical landmark plaques and pedestals.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live WYSIWYG Plaque Preview */}
          <div className="md:col-span-6 flex flex-col items-center">
            {/* Plaque Card Container */}
            <div
              className={`w-full max-w-[310px] rounded-lg p-5 shadow-xl border-2 transition-all ${
                isDarkPreview
                  ? "bg-gradient-to-b from-[#19191c] via-[#121214] to-[#0a0a0c] border-[#c5a059] text-white"
                  : "bg-white border-[#a88038] text-neutral-900 shadow-md"
              }`}
            >
              {/* Inner Plaque Border */}
              <div
                className={`flex flex-col items-center rounded border p-4 text-center ${
                  isDarkPreview ? "border-[#c5a059]/40 bg-black/20" : "border-[#a88038]/30 bg-[#faf8f5]/50"
                }`}
              >
                {/* Header Badge */}
                <div className="mb-1">
                  <span
                    className={`font-serif text-[10px] font-bold tracking-[0.18em] uppercase ${
                      isDarkPreview ? "text-[#c5a059]" : "text-[#8c6b23]"
                    }`}
                  >
                    Daet Cultural Heritage Marker
                  </span>
                  <p
                    className={`text-[8.5px] uppercase tracking-wider ${
                      isDarkPreview ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    Official On-Site Guide
                  </p>
                </div>

                {/* Decorative Line */}
                <div className="mb-3.5 flex items-center justify-center gap-1.5 w-full">
                  <div className={`h-[1px] w-12 ${isDarkPreview ? "bg-[#c5a059]/40" : "bg-[#a88038]/40"}`} />
                  <div className={`size-1 rotate-45 ${isDarkPreview ? "bg-[#c5a059]" : "bg-[#a88038]"}`} />
                  <div className={`h-[1px] w-12 ${isDarkPreview ? "bg-[#c5a059]/40" : "bg-[#a88038]/40"}`} />
                </div>

                {/* QR Canvas rendered at 512x512 with embedded logo */}
                <div
                  ref={canvasRef}
                  className="rounded-md border-2 border-[#c5a059]/50 bg-white p-2.5 shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <QRCodeCanvas
                    value={fullUrl}
                    size={800}
                    level="H"
                    includeMargin={true}
                    marginSize={2}
                    style={{ width: "175px", height: "175px" }}
                    imageSettings={{
                      src: safeQrLogo,
                      height: 160,
                      width: 160,
                      excavate: true,
                      crossOrigin: "anonymous",
                    }}
                  />
                </div>

                {/* Scan Pill */}
                <div
                  className={`mt-3 w-full rounded-full border px-2 py-1 text-[9px] font-bold tracking-wide ${
                    isDarkPreview
                      ? "border-[#c5a059]/60 bg-[#c5a059]/15 text-[#e5c07b]"
                      : "border-[#a88038]/60 bg-[#fbf6ea] text-[#8c6b23]"
                  }`}
                >
                  SCAN TO EXPLORE 360° TOUR
                </div>

                {/* Landmark Info */}
                <div className="mt-3 w-full space-y-1">
                  <p className="font-serif text-sm font-bold leading-snug line-clamp-2 px-1">{title}</p>
                  {barangay && (
                    <p
                      className={`text-[10.5px] flex items-center justify-center gap-1 ${
                        isDarkPreview ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      <MapPin className="size-2.5 text-[#c5a059] shrink-0" />
                      <span>
                        {barangay.trim().replace(/^(barangay|brgy\.?)\s+/i, "")
                          ? `Barangay ${barangay.trim().replace(/^(barangay|brgy\.?)\s+/i, "")}, Daet`
                          : "Daet, Camarines Norte"}
                      </span>
                    </p>
                  )}
                  {category && (
                    <div className="pt-0.5">
                      <span
                        className={`inline-block rounded border px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wider ${
                          isDarkPreview
                            ? "border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059]"
                            : "border-[#a88038]/40 bg-[#a88038]/10 text-[#8c6b23]"
                        }`}
                      >
                        {category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Plaque Footer */}
                <div
                  className={`mt-3 pt-2 w-full border-t text-[7.5px] uppercase tracking-wider ${
                    isDarkPreview ? "border-white/10 text-neutral-400" : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  <p className="font-semibold">Daet Immersive Cultural Heritage</p>
                  <p className="text-[7px]">Tourism & Cultural Affairs Office</p>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[10.5px] text-muted-foreground text-center">
              WYSIWYG Live Preview • Downloads at 1200 × 1680 px print resolution
            </p>
          </div>

          {/* Right Column: Style Options, Specs & Actions */}
          <div className="md:col-span-6 space-y-4">
            {/* Plaque Style / Color Palette Selector */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Palette className="size-3.5 text-[#c5a059]" />
                <span>Select Plaque Material / Style</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPlaqueTheme("dark")}
                  className={`flex flex-col items-start p-2.5 rounded-md border text-left transition-all ${
                    plaqueTheme === "dark"
                      ? "border-[#c5a059] bg-[#c5a059]/10 ring-1 ring-[#c5a059]"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-foreground">Heritage Bronze</span>
                    {plaqueTheme === "dark" && <Check className="size-3 text-[#c5a059]" />}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground mt-0.5">
                    Dark obsidian & gold. Best for metal or acrylic plaques.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlaqueTheme("light")}
                  className={`flex flex-col items-start p-2.5 rounded-md border text-left transition-all ${
                    plaqueTheme === "light"
                      ? "border-[#c5a059] bg-[#c5a059]/10 ring-1 ring-[#c5a059]"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-foreground">Classic Light</span>
                    {plaqueTheme === "light" && <Check className="size-3 text-[#c5a059]" />}
                  </div>
                  <span className="text-[10.5px] text-muted-foreground mt-0.5">
                    Crisp white & brass. Ideal for paper print, photo card, or laminate.
                  </span>
                </button>
              </div>
            </div>

            {/* Specifications Details */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground font-mono uppercase tracking-wider">
                <Sparkles className="size-3.5 text-[#c5a059]" />
                <span>Field Signage Specifications</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#c5a059] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Full Plaque Signage:</strong> Includes site name, barangay,
                    official seal, and scan directions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#c5a059] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">1200 × 1680 px:</strong> High-DPI resolution ready for laser
                    engraving, metal fabrication, or UV printing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-[#c5a059] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">Level H (30%) Error Correction:</strong> Robust against weather,
                    sun reflection, and surface scratches.
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col gap-2">
              <Button
                onClick={handleDownloadPlaque}
                className="w-full gap-2 bg-[#c5a059] text-neutral-950 font-semibold hover:bg-[#b08e4c] text-xs h-10 shadow-sm"
              >
                <Download className="size-4" />
                <span>Download Complete Plaque Marker (PNG)</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQROnly}
                  className="flex-1 gap-1.5 text-xs h-8"
                  title="Export raw QR square only"
                >
                  <ImageIcon className="size-3" />
                  <span>Download QR Only</span>
                </Button>

                <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8">
                  <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3" />
                    <span>Open Public View</span>
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs h-8 px-3 text-muted-foreground"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

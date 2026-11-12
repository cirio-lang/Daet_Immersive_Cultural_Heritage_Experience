"use client";

import { useEffect, useState } from "react";

import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { SiteQRDialog } from "@/components/qr/site-qr-dialog";
import { Button } from "@/components/ui/button";

interface SiteQRCodeProps {
  slug: string;
  title: string;
  logoUrl?: string | null;
  barangay?: string;
  category?: string;
}

export function SiteQRCode({ slug, title, logoUrl, barangay, category }: SiteQRCodeProps) {
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      setSiteUrl(`${siteOrigin}/sites/${slug}?source=qr`);
    }
  }, [slug]);

  const targetUrl = siteUrl || `https://daet-heritage.ph/sites/${slug}?source=qr`;
  const qrLogo = logoUrl || "/images/logo/the-heritage-threshold-logo.png";

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-md border border-[#c5a059]/30 bg-white p-2 shadow-sm">
        <QRCodeSVG
          value={targetUrl}
          size={168}
          level="H"
          includeMargin={false}
          aria-label={`QR Code for ${title}`}
          imageSettings={{
            src: qrLogo,
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>
      <span className="mt-2 font-mono text-[10px] text-neutral-500 truncate max-w-[180px]">/sites/{slug}</span>

      <Button
        variant="outline"
        size="xs"
        onClick={() => setDialogOpen(true)}
        className="mt-3 gap-1.5 border-[#c5a059]/40 text-[11px] text-[#c5a059] hover:bg-[#c5a059]/10"
      >
        <Download className="size-3" />
        <span>Print Quality Marker</span>
      </Button>

      <SiteQRDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slug={slug}
        title={title}
        logoUrl={logoUrl}
        barangay={barangay}
        category={category}
      />
    </div>
  );
}

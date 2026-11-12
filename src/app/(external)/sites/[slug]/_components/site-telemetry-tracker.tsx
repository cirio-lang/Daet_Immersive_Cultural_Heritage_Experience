"use client";

import { useEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { recordSiteScan } from "../actions";

interface SiteTelemetryTrackerProps {
  siteId: string;
}

function detectDeviceType(): string {
  if (typeof window === "undefined" || !navigator.userAgent) return "Mobile";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
}

export function SiteTelemetryTracker({ siteId }: SiteTelemetryTrackerProps) {
  const searchParams = useSearchParams();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current || !siteId) return;
    hasLogged.current = true;

    const sourceParam = searchParams.get("source");
    const qrParam = searchParams.get("qr");
    const isQR = sourceParam === "qr" || qrParam === "1";

    const deviceType = detectDeviceType();
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

    // Send telemetry record
    recordSiteScan({
      siteId,
      source: isQR ? "qr" : "web",
      deviceType,
      referrer: referrer || undefined,
      userAgent: userAgent.slice(0, 255),
    }).catch(() => {
      // Non-blocking catch
    });
  }, [siteId, searchParams]);

  return null;
}

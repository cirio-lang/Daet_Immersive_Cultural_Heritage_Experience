import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

import { DashboardOverview, type DashboardOverviewData } from "./_components/dashboard-overview";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview & Telemetry",
  description:
    "Real-time audience analytics, QR scan telemetry, and heritage site metrics for the Daet Immersive Cultural Heritage Experience.",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch heritage site and panorama counts — always real
  const [sitesRes, panoramasRes, scansRes] = await Promise.all([
    supabase.from("heritage_sites").select("id, title, slug, category, is_published, panorama_360_url"),
    supabase.from("heritage_panoramas").select("id"),
    supabase
      .from("site_scans")
      .select("id, site_id, scanned_at, device_type, source, city")
      .order("scanned_at", { ascending: false })
      .limit(500),
  ]);

  const sites = sitesRes.data ?? [];
  const totalSites = sites.length;
  const publishedSites = sites.filter((s: Record<string, unknown>) => s.is_published).length;
  const totalPanoramas = panoramasRes.data?.length ?? 0;
  const scans = scansRes.data ?? [];

  // Build site lookup map
  const siteMap = new Map<string, Record<string, unknown>>();
  for (const s of sites) {
    siteMap.set(s.id as string, s);
  }

  // Scan totals — real counts, zero if table is empty
  const totalScans = scans.length;
  const totalQrScans = scans.filter((s: Record<string, unknown>) => s.source === "qr").length;
  const totalWebScans = totalScans - totalQrScans;
  const qrPercentage = totalScans > 0 ? Math.round((totalQrScans / totalScans) * 100) : 0;

  // Daily trends (last 14 days)
  const today = new Date();
  const dayBuckets = new Map<string, { qr: number; web: number }>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    dayBuckets.set(d.toISOString().split("T")[0], { qr: 0, web: 0 });
  }
  for (const scan of scans) {
    const day = (scan.scanned_at as string).split("T")[0];
    const bucket = dayBuckets.get(day);
    if (bucket) {
      if (scan.source === "qr") bucket.qr++;
      else bucket.web++;
    }
  }
  const dailyTrends = Array.from(dayBuckets.entries()).map(([date, counts]) => {
    const d = new Date(date + "T00:00:00");
    return {
      date,
      displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      qrScans: counts.qr,
      webScans: counts.web,
      total: counts.qr + counts.web,
    };
  });

  // Device breakdown
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
  for (const scan of scans) {
    const dt = ((scan.device_type as string) || "Mobile").toLowerCase();
    if (dt.includes("tablet")) deviceCounts.tablet++;
    else if (dt.includes("desktop")) deviceCounts.desktop++;
    else deviceCounts.mobile++;
  }
  const deviceBreakdown = [
    { name: "Mobile", value: deviceCounts.mobile, device: "mobile" as const },
    { name: "Desktop", value: deviceCounts.desktop, device: "desktop" as const },
    { name: "Tablet", value: deviceCounts.tablet, device: "tablet" as const },
  ];

  // Top landmarks by scan count
  const landmarkMap = new Map<string, { qr: number; web: number; total: number }>();
  for (const scan of scans) {
    const siteId = scan.site_id as string;
    if (!landmarkMap.has(siteId)) {
      landmarkMap.set(siteId, { qr: 0, web: 0, total: 0 });
    }
    const lm = landmarkMap.get(siteId)!;
    lm.total++;
    if (scan.source === "qr") lm.qr++;
    else lm.web++;
  }
  const topLandmarks = Array.from(landmarkMap.entries())
    .map(([siteId, counts]) => {
      const site = siteMap.get(siteId);
      return {
        siteId,
        title: (site?.title as string) || "Unknown Landmark",
        slug: (site?.slug as string) || "",
        category: (site?.category as string) || "",
        totalScans: counts.total,
        qrScans: counts.qr,
        webScans: counts.web,
        hasPanorama: Boolean(site?.panorama_360_url),
      };
    })
    .sort((a, b) => b.totalScans - a.totalScans)
    .slice(0, 10);

  // Recent scan stream
  const recentScans = scans.slice(0, 15).map((scan: Record<string, unknown>) => {
    const site = siteMap.get(scan.site_id as string);
    return {
      id: scan.id as string,
      siteId: scan.site_id as string,
      siteTitle: (site?.title as string) || "Unknown Landmark",
      siteSlug: (site?.slug as string) || "",
      scannedAt: formatRelativeTime(scan.scanned_at as string),
      deviceType: (((scan.device_type as string) || "mobile").toLowerCase().includes("tablet")
        ? "tablet"
        : ((scan.device_type as string) || "mobile").toLowerCase().includes("desktop")
          ? "desktop"
          : "mobile") as "mobile" | "desktop" | "tablet",
      source: (scan.source as "qr" | "web") || "web",
      city: scan.city as string | undefined,
    };
  });

  const dashboardData: DashboardOverviewData = {
    totalScans,
    totalQrScans,
    totalWebScans,
    totalSites,
    publishedSites,
    totalPanoramas,
    qrPercentage,
    dailyTrends,
    deviceBreakdown,
    topLandmarks,
    recentScans,
  };

  return <DashboardOverview data={dashboardData} />;
}

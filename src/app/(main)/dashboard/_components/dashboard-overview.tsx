"use client";

import * as React from "react";

import Link from "next/link";

import {
  Activity,
  ArrowUpRight,
  Compass,
  Download,
  Globe,
  Landmark,
  Monitor,
  QrCode,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface TelemetryScanItem {
  id: string;
  siteId: string;
  siteTitle: string;
  siteSlug: string;
  scannedAt: string;
  deviceType: "mobile" | "desktop" | "tablet";
  source: "qr" | "web";
  city?: string;
}

export interface LandmarkScanStat {
  siteId: string;
  title: string;
  slug: string;
  category: string;
  totalScans: number;
  qrScans: number;
  webScans: number;
  hasPanorama: boolean;
}

export interface DayScanTrend {
  date: string;
  displayDate: string;
  qrScans: number;
  webScans: number;
  total: number;
}

export interface DeviceStat {
  name: string;
  value: number;
  device: "mobile" | "desktop" | "tablet";
}

export interface DashboardOverviewData {
  totalScans: number;
  totalQrScans: number;
  totalWebScans: number;
  totalSites: number;
  publishedSites: number;
  totalPanoramas: number;
  qrPercentage: number;
  dailyTrends: DayScanTrend[];
  deviceBreakdown: DeviceStat[];
  topLandmarks: LandmarkScanStat[];
  recentScans: TelemetryScanItem[];
}

interface DashboardOverviewProps {
  data: DashboardOverviewData;
}

const trendChartConfig = {
  qrScans: {
    label: "Physical QR Placard",
    color: "#c5a059",
  },
  webScans: {
    label: "Online Catalogue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const DEVICE_COLORS = {
  mobile: "#c5a059",
  desktop: "#3b82f6",
  tablet: "#10b981",
};

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Landmark", "Source", "Device", "Timestamp"];
    const rows = data.recentScans.map((s) => [
      s.id,
      `"${s.siteTitle.replace(/"/g, '""')}"`,
      s.source === "qr" ? "Physical QR" : "Web",
      s.deviceType,
      s.scannedAt,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daet_heritage_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview & Telemetry</h1>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium gap-1 py-0.5"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time audience physical QR interactions, 360° photogrammetry exploration, and site metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2 text-xs font-medium border-border/80"
          >
            <Download className="size-3.5" />
            Export Telemetry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 text-xs font-medium border-border/80"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Scans */}
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Total Audience Visits
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              {data.totalScans.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-500" />
            <span>
              <strong className="text-foreground font-medium">{data.qrPercentage}%</strong> physical on-site scans
            </span>
          </CardContent>
        </Card>

        {/* Card 2: Physical QR Scans */}
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Physical QR Placards
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-[#c5a059]">
              {data.totalQrScans.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <QrCode className="size-3.5 text-[#c5a059]" />
            <span>Scanned from museum & landmark plaques</span>
          </CardContent>
        </Card>

        {/* Card 3: Heritage Sites */}
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Heritage Sites
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">{data.totalSites}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <Landmark className="size-3.5 text-[#c5a059]" />
            <span>
              <strong className="text-foreground font-medium">{data.publishedSites}</strong> publicly accessible
            </span>
          </CardContent>
        </Card>

        {/* Card 4: 360 Panoramas */}
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              360° Panoramas
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              {data.totalPanoramas}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <Compass className="size-3.5 text-primary" />
            <span>Virtual photogrammetry nodes active</span>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Trend Chart & Device Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend Area Chart (2 Cols) */}
        <Card className="border-border/60 bg-card/80 shadow-xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Audience Scans & Visits Timeline
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Daily comparison between on-site QR placard scans and online web visitors.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#c5a059]" />
                <span className="text-muted-foreground">Physical QR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">Online Web</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={trendChartConfig} className="h-[280px] w-full">
              <AreaChart data={data.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillQrScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillWebScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  type="monotone"
                  dataKey="qrScans"
                  name="Physical QR"
                  stroke="#c5a059"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fillQrScans)"
                />
                <Area
                  type="monotone"
                  dataKey="webScans"
                  name="Online Web"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fillWebScans)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown (1 Col) */}
        <Card className="border-border/60 bg-card/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Device Distribution</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Audience hardware used to experience the heritage sites.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center justify-center">
            <div className="h-[180px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.deviceBreakdown} innerRadius={48} outerRadius={75} paddingAngle={4} dataKey="value">
                    {data.deviceBreakdown.map((entry) => (
                      <Cell key={`cell-${entry.device}`} fill={DEVICE_COLORS[entry.device] || "#6b7280"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Device Legend */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/50">
              {data.deviceBreakdown.map((item) => {
                const total = data.totalScans || 1;
                const pct = Math.round((item.value / total) * 100);
                const Icon = item.device === "mobile" ? Smartphone : item.device === "tablet" ? Tablet : Monitor;
                return (
                  <div key={item.device} className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className="size-3.5" style={{ color: DEVICE_COLORS[item.device] }} />
                      <span className="capitalize">{item.device}</span>
                    </div>
                    <span className="text-base font-semibold text-foreground mt-0.5">{pct}%</span>
                    <span className="text-[11px] text-muted-foreground">{item.value.toLocaleString()} scans</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Top Explored Landmarks & Live Activity Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Explored Landmarks (5 Cols) */}
        <Card className="border-border/60 bg-card/80 shadow-xs lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Top Explored Landmarks</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Most engaged sites by physical and digital visitors.
              </CardDescription>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard/heritage-sites">
                View All
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col gap-4">
              {data.topLandmarks.slice(0, 5).map((site, index) => {
                const maxScans = data.topLandmarks[0]?.totalScans || 1;
                const percentage = Math.round((site.totalScans / maxScans) * 100);

                return (
                  <div key={site.siteId} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
                          {index + 1}
                        </span>
                        <Link
                          href={`/sites/${site.slug}`}
                          target="_blank"
                          className="font-medium text-foreground hover:text-[#c5a059] transition-colors truncate max-w-[200px]"
                        >
                          {site.title}
                        </Link>
                        {site.hasPanorama && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 text-primary border-primary/30">
                            360°
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-semibold text-foreground">{site.totalScans}</span>
                        <span className="text-[11px]">scans</span>
                      </div>
                    </div>

                    {/* Progress bar with QR share indicator */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{site.qrScans} on-site QR</span>
                      <span>{site.webScans} online visitors</span>
                    </div>
                  </div>
                );
              })}

              {data.topLandmarks.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">No landmark activity recorded yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Telemetry Activity Stream (7 Cols) */}
        <Card className="border-border/60 bg-card/80 shadow-xs lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="size-4 text-[#c5a059]" />
                Recent Audience Activity Stream
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time capture of audience QR scans and immersive session visits.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              Latest {data.recentScans.length} events
            </Badge>
          </CardHeader>
          <CardContent className="pt-2 p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground">Landmark</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Entry Method</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Device</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentScans.slice(0, 7).map((scan) => {
                    const DeviceIcon =
                      scan.deviceType === "mobile" ? Smartphone : scan.deviceType === "tablet" ? Tablet : Monitor;

                    return (
                      <TableRow key={scan.id} className="hover:bg-muted/40 text-xs">
                        <TableCell className="font-medium text-foreground py-2.5">
                          <Link
                            href={`/sites/${scan.siteSlug}`}
                            target="_blank"
                            className="hover:text-[#c5a059] transition-colors truncate block max-w-[200px]"
                          >
                            {scan.siteTitle}
                          </Link>
                        </TableCell>
                        <TableCell className="py-2.5">
                          {scan.source === "qr" ? (
                            <Badge
                              variant="outline"
                              className="border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] text-[11px] font-medium gap-1 py-0.5"
                            >
                              <QrCode className="size-3" />
                              Physical QR
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-border text-muted-foreground text-[11px] font-medium gap-1 py-0.5"
                            >
                              <Globe className="size-3" />
                              Web Portal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 text-muted-foreground">
                          <div className="flex items-center gap-1.5 capitalize text-xs">
                            <DeviceIcon className="size-3.5" />
                            <span>{scan.deviceType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-muted-foreground text-right text-xs">
                          {scan.scannedAt}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {data.recentScans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                        No telemetry entries found yet. Scans from physical QR plaques or web visits will appear here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

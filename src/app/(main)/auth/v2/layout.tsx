import type { ReactNode } from "react";

import { Landmark, QrCode, ShieldCheck, Sparkles, View } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  let heroImageSrc = "/images/hero-bg.jpg";
  let logoUrl: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_content")
      .select("hero_image_url, logo_url")
      .eq("id", "landing_page")
      .single();

    if (data?.hero_image_url) {
      heroImageSrc = data.hero_image_url;
    }
    if (data?.logo_url) {
      logoUrl = data.logo_url;
    }
  } catch {
    // Fall back to default static assets
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#05080f] text-foreground">
      {/* Subtle atmospheric ambient glow across the whole page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={heroImageSrc}
          alt="Atmospheric Background"
          className="h-full w-full object-cover object-center brightness-[0.20] blur-2xl opacity-40 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05080f] via-[#05080f]/85 to-[#05080f]/75" />
      </div>

      <div className="relative z-10 grid min-h-dvh justify-center p-3 lg:grid-cols-2 lg:p-4 gap-4">
        {/* Right Column: Dynamic Cultural Heritage Showcase Card */}
        <div className="relative order-2 hidden h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#c5a059]/40 bg-[#080d17] p-8 lg:p-12 lg:flex text-white shadow-2xl">
          {/* Dynamic Hero Cover Background - Placed in front of parent background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={heroImageSrc}
              alt="Daet Historical Landmark"
              className="h-full w-full object-cover object-center brightness-[0.75] contrast-[1.05]"
            />
            {/* Theatrical Vignette Overlays & Subtle Ambient Warm Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080d17]/95 via-[#080d17]/55 to-[#080d17]/70" />
            <div className="absolute inset-0 bg-radial-[at_50%_35%] from-[#c5a059]/25 via-transparent to-transparent" />
          </div>

          {/* Top Section: Official Municipal Heritage Identity */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl border border-[#c5a059]/50 bg-[#080d17]/85 text-[#c5a059] shadow-inner shadow-[#c5a059]/30 overflow-hidden p-2 backdrop-blur-md">
                {logoUrl ? (
                  <img src={logoUrl} alt="Daet Crest" className="size-full object-contain" />
                ) : (
                  <Landmark className="size-6 text-[#c5a059]" strokeWidth={1.75} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#c5a059] uppercase">
                    Municipality of Daet
                  </span>
                  <span className="inline-block size-1 rounded-full bg-[#c5a059]/60" />
                  <span className="text-xs text-zinc-300">Camarines Norte</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{APP_CONFIG.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-[11px] text-emerald-400 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Portal Online</span>
            </div>
          </div>

          {/* Middle Section: Hero Curatorial Narrative & Feature Pillars */}
          <div className="relative z-10 my-auto py-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#c5a059]/15 px-3.5 py-1 text-xs font-medium text-[#c5a059] backdrop-blur-md">
                <Sparkles className="size-3.5" />
                <span>Digital Curation & Telemetry Console</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
                Preserving historic valor through 360° panoramic views and intelligent telemetry.
              </h3>
              <p className="text-sm leading-relaxed text-zinc-200 max-w-lg drop-shadow-sm">
                Manage 360° photogrammetry views, generate physical QR placards for landmark pedestals, and analyze
                on-site visitor engagement across Daet.
              </p>
            </div>

            {/* Visual Highlights Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/15 bg-[#080d17]/80 p-4 backdrop-blur-md transition-all duration-200 hover:border-[#c5a059]/50 hover:bg-[#080d17]/95 shadow-lg shadow-black/40">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#c5a059]/20 text-[#c5a059] mb-3">
                  <View className="size-4" />
                </div>
                <p className="text-base font-bold text-white">360° Panorama</p>
                <p className="text-[11px] text-zinc-300 leading-snug mt-1">Interactive panoramic viewer</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#080d17]/80 p-4 backdrop-blur-md transition-all duration-200 hover:border-[#c5a059]/50 hover:bg-[#080d17]/95 shadow-lg shadow-black/40">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#c5a059]/20 text-[#c5a059] mb-3">
                  <QrCode className="size-4" />
                </div>
                <p className="text-base font-bold text-white">QR Telemetry</p>
                <p className="text-[11px] text-zinc-300 leading-snug mt-1">Physical monument plaque scans</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#080d17]/80 p-4 backdrop-blur-md transition-all duration-200 hover:border-[#c5a059]/50 hover:bg-[#080d17]/95 shadow-lg shadow-black/40">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#c5a059]/20 text-[#c5a059] mb-3">
                  <ShieldCheck className="size-4" />
                </div>
                <p className="text-base font-bold text-white">Verified</p>
                <p className="text-[11px] text-zinc-300 leading-snug mt-1">Archival historical curation</p>
              </div>
            </div>

            {/* Cultural Inscription Strip */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#c5a059]/30 bg-[#080d17]/80 p-4 backdrop-blur-md shadow-lg shadow-black/40">
              <div className="size-2 rounded-full bg-[#c5a059] shrink-0 animate-ping" />
              <p className="text-xs text-zinc-200 italic leading-relaxed">
                &ldquo;Home to the First Rizal Monument erected in 1898 — the oldest memorial to the national hero in
                the Philippines.&rdquo;
              </p>
            </div>
          </div>

          {/* Bottom Section: Dignified Administrative Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#c5a059]" />
              <span>Municipal Government of Daet · Administrative Console</span>
            </div>
            <span className="font-mono text-[11px] text-[#c5a059]">Est. 1583</span>
          </div>
        </div>

        {/* Left Column: Login Form */}
        <div className="relative order-1 flex h-full items-center justify-center">{children}</div>
      </div>
    </main>
  );
}

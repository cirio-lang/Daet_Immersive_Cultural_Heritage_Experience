import { Suspense } from "react";

import type { Metadata } from "next";

import { DEFAULT_HERITAGE_SITES } from "@/data/default-heritage-sites";
import { createClient } from "@/lib/supabase/server";
import type { HeritageSite } from "@/types/heritage";

import { HeritageSites } from "./_components/heritage-sites";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Heritage Sites Registry",
  description:
    "Curatorial management and 360° photogrammetry registry for the Daet Immersive Cultural Heritage Experience.",
};

export default async function HeritageSitesPage() {
  let sites: HeritageSite[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("heritage_sites")
      .select("*, heritage_panoramas(id, panorama_url, label, sort_order, created_at)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase heritage_sites query warning:", error.message);
      sites = DEFAULT_HERITAGE_SITES;
    } else if (data && data.length > 0) {
      sites = data.map((row: Record<string, unknown>) => ({
        ...row,
        panoramas: Array.isArray(row.heritage_panoramas)
          ? (row.heritage_panoramas as Record<string, unknown>[]).sort(
              (a: Record<string, unknown>, b: Record<string, unknown>) =>
                ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
            )
          : [],
        heritage_panoramas: undefined,
      })) as unknown as HeritageSite[];
    } else {
      sites = DEFAULT_HERITAGE_SITES;
    }
  } catch (err) {
    console.error("Failed to load heritage_sites from Supabase:", err);
    sites = DEFAULT_HERITAGE_SITES;
  }

  return (
    <Suspense fallback={null}>
      <HeritageSites initialSites={sites} />
    </Suspense>
  );
}

import type { Metadata } from "next";

import { DEFAULT_SITE_CONTENT } from "@/data/default-site-content";
import { createClient } from "@/lib/supabase/server";
import type { SiteContent } from "@/types/site-content";

import { SiteContentLoader } from "./_components/site-content-loader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Content Management",
  description: "Curatorial management of the public landing page, hero showcase, and curatorial chapters.",
};

export default async function SiteContentPage() {
  let content: SiteContent = DEFAULT_SITE_CONTENT;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_content").select("*").eq("id", "landing_page").single();

    if (error) {
      console.warn("Supabase site_content query warning (using defaults):", error.message);
      content = DEFAULT_SITE_CONTENT;
    } else if (data) {
      content = {
        ...DEFAULT_SITE_CONTENT,
        ...data,
      };
    }
  } catch (err) {
    console.error("Failed to load site_content from Supabase (using defaults):", err);
    content = DEFAULT_SITE_CONTENT;
  }

  return <SiteContentLoader initialContent={content} />;
}

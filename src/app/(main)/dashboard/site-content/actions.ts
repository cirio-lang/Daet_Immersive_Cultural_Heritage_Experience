"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { SiteContent } from "@/types/site-content";

export async function updateSiteContent(
  payload: Partial<SiteContent>,
): Promise<{ success: boolean; error?: string; warning?: string }> {
  try {
    const supabase = await createClient();

    const updatePayload = { ...payload };
    let warning: string | undefined;

    let { error } = await supabase.from("site_content").upsert(
      {
        id: "landing_page",
        ...updatePayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    // If dynamic columns don't exist yet in Supabase schema cache, dynamically strip them and retry
    let retries = 5;
    const strippedColumns: string[] = [];
    while (error && error.message.includes("schema cache") && retries > 0) {
      retries--;
      // Match column name from PostgREST error: "Could not find the 'column_name' column of 'site_content' in the schema cache"
      const match = error.message.match(/Could not find the '([^']+)' column/i);
      const col = match?.[1] as keyof SiteContent | undefined;

      if (col && col in updatePayload) {
        strippedColumns.push(col);
        delete (updatePayload as Record<string, unknown>)[col];

        const retryResult = await supabase.from("site_content").upsert(
          {
            id: "landing_page",
            ...updatePayload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
        error = retryResult.error;
      } else {
        // Fallback for known dynamic columns if error format differs
        const knownColumns: (keyof SiteContent)[] = [
          "chapter_1_highlights",
          "logo_url",
          "chapter_2_plate_1_title",
          "chapter_2_plate_1_location",
          "chapter_2_plate_2_title",
          "chapter_2_plate_2_location",
          "chapter_2_quote_attribution",
        ];
        let strippedAny = false;
        for (const k of knownColumns) {
          if (error.message.includes(k) && k in updatePayload) {
            strippedColumns.push(k);
            delete (updatePayload as Record<string, unknown>)[k];
            strippedAny = true;
          }
        }
        if (strippedAny) {
          const retryResult = await supabase.from("site_content").upsert(
            {
              id: "landing_page",
              ...updatePayload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          );
          error = retryResult.error;
        } else {
          break;
        }
      }
    }

    if (strippedColumns.length > 0 && !error) {
      warning = `Na-save lahat ng content! Note: Missing column(s) [${strippedColumns.join(", ")}] sa database. Para mag-persist ito, run the SQL migration in Supabase SQL Editor.`;
    }

    if (error) {
      console.error("Failed to update site_content:", error);
      return { success: false, error: error.message };
    }

    // Revalidate public landing page and the admin dashboard layout
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/site-content");

    return { success: true, warning };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error updating site content";
    console.error("Error in updateSiteContent action:", err);
    return { success: false, error: message };
  }
}

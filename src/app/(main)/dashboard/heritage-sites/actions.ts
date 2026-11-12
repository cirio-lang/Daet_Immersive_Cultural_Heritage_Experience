"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { HeritageCategory, HeritagePanorama, HeritageSite } from "@/types/heritage";

export interface SaveHeritageSiteInput {
  id?: string;
  slug: string;
  title: string;
  short_description?: string | null;
  historical_context?: string | null;
  significance?: string | null;
  additional_sections?: Array<{ label: string; content: string }>;
  category: HeritageCategory;
  barangay: string;
  municipality?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  year_built?: string | null;
  cover_image_url?: string | null;
  gallery_images?: string[];
  panorama_360_url?: string | null;
  panoramas?: SavePanoramaInput[];
  audio_guide_url?: string | null;
  is_published?: boolean;
}

export async function saveHeritageSite(data: SaveHeritageSiteInput) {
  try {
    const supabase = await createClient();

    // Check user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in as an Administrator." };
    }

    // Determine primary 360 url for backward compatibility
    let primaryPanorama = data.panorama_360_url?.trim() || null;
    if (data.panoramas !== undefined) {
      primaryPanorama = data.panoramas.length > 0 ? data.panoramas[0].panorama_url.trim() : null;
    }

    const payload = {
      slug: data.slug.trim().toLowerCase(),
      title: data.title.trim(),
      short_description: data.short_description?.trim() || null,
      historical_context: data.historical_context?.trim() || null,
      significance: data.significance?.trim() || null,
      additional_sections: data.additional_sections ?? [],
      category: data.category,
      barangay: data.barangay.trim(),
      municipality: data.municipality?.trim() || "Daet",
      province: data.province?.trim() || "Camarines Norte",
      latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
      longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null,
      year_built: data.year_built?.trim() || null,
      cover_image_url: data.cover_image_url?.trim() || null,
      gallery_images: data.gallery_images ?? [],
      panorama_360_url: primaryPanorama,
      audio_guide_url: data.audio_guide_url?.trim() || null,
      is_published: data.is_published ?? false,
      updated_at: new Date().toISOString(),
    };

    let siteId = data.id;
    let siteResult: HeritageSite | null = null;

    if (data.id) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("heritage_sites")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      siteId = updated.id;
      siteResult = updated as HeritageSite;
    } else {
      // Insert new
      const { data: created, error } = await supabase
        .from("heritage_sites")
        .insert({
          ...payload,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      siteId = created.id;
      siteResult = created as HeritageSite;
    }

    // Save multi-panoramas if provided
    if (data.panoramas !== undefined && siteId) {
      // Delete existing panoramas for this site
      const { error: delErr } = await supabase.from("heritage_panoramas").delete().eq("site_id", siteId);
      if (delErr) {
        console.warn("Failed to clear old panoramas:", delErr.message);
      }

      if (data.panoramas.length > 0) {
        const rows = data.panoramas
          .filter((p) => p.panorama_url && p.panorama_url.trim())
          .map((p, idx) => ({
            site_id: siteId,
            panorama_url: p.panorama_url.trim(),
            label: p.label.trim() || `View ${idx + 1}`,
            sort_order: p.sort_order ?? idx,
          }));

        if (rows.length > 0) {
          const { error: insErr } = await supabase.from("heritage_panoramas").insert(rows);
          if (insErr) {
            console.error("Failed to insert panoramas:", insErr.message);
          }
        }
      }
    }

    revalidatePath("/dashboard/heritage-sites");
    revalidatePath("/");
    revalidatePath(`/sites/${data.slug}`);
    return { success: true, site: siteResult };
  } catch (err: unknown) {
    console.error("saveHeritageSite error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save heritage site.",
    };
  }
}

export async function deleteHeritageSite(siteId: string, slug?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in as an Administrator." };
    }

    const { error } = await supabase.from("heritage_sites").delete().eq("id", siteId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/heritage-sites");
    revalidatePath("/");
    if (slug) {
      revalidatePath(`/sites/${slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("deleteHeritageSite error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete heritage site.",
    };
  }
}

export async function toggleSitePublish(siteId: string, isPublished: boolean, slug?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in as an Administrator." };
    }

    const { error } = await supabase
      .from("heritage_sites")
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq("id", siteId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/heritage-sites");
    revalidatePath("/");
    if (slug) {
      revalidatePath(`/sites/${slug}`);
    }

    return { success: true, is_published: isPublished };
  } catch (err: unknown) {
    console.error("toggleSitePublish error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update publish status.",
    };
  }
}

export interface SavePanoramaInput {
  panorama_url: string;
  label: string;
  sort_order: number;
}

export async function saveSitePanoramas(siteId: string, panoramas: SavePanoramaInput[], slug?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in as an Administrator." };
    }

    // Delete all existing panoramas for this site
    const { error: deleteError } = await supabase.from("heritage_panoramas").delete().eq("site_id", siteId);

    if (deleteError) {
      return { success: false, error: `Failed to clear existing panoramas: ${deleteError.message}` };
    }

    // Insert new panoramas (if any)
    if (panoramas.length > 0) {
      const rows = panoramas.map((p, idx) => ({
        site_id: siteId,
        panorama_url: p.panorama_url.trim(),
        label: p.label.trim() || "Main View",
        sort_order: p.sort_order ?? idx,
      }));

      const { error: insertError } = await supabase.from("heritage_panoramas").insert(rows);

      if (insertError) {
        return { success: false, error: `Failed to save panoramas: ${insertError.message}` };
      }
    }

    // Also update the legacy panorama_360_url column for backward compatibility
    const primaryUrl = panoramas.length > 0 ? panoramas[0].panorama_url.trim() : null;
    await supabase
      .from("heritage_sites")
      .update({ panorama_360_url: primaryUrl, updated_at: new Date().toISOString() })
      .eq("id", siteId);

    revalidatePath("/dashboard/heritage-sites");
    revalidatePath("/");
    if (slug) {
      revalidatePath(`/sites/${slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("saveSitePanoramas error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save panoramas.",
    };
  }
}

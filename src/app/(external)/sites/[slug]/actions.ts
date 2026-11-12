"use server";

import { createClient } from "@/lib/supabase/server";

export interface LogScanParams {
  siteId: string;
  source?: "qr" | "web";
  deviceType?: string;
  referrer?: string;
  userAgent?: string;
}

export async function recordSiteScan(params: LogScanParams): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("site_scans").insert({
      site_id: params.siteId,
      source: params.source ?? "web",
      device_type: params.deviceType || "Mobile",
      referrer: params.referrer || null,
      user_agent: params.userAgent || null,
      scanned_at: new Date().toISOString(),
    });

    if (error) {
      // Table may not exist yet or schema cache pending - fail gracefully
      console.warn("Scan telemetry insert warning:", error.message);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.warn("Scan telemetry error:", err);
    return { success: false };
  }
}

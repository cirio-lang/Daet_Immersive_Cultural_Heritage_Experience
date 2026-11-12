"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function RealtimeRefresh() {
  const router = useRouter();

  React.useEffect(() => {
    // 1. Instant cross-tab sync via BroadcastChannel (0ms latency within the same browser)
    const bc =
      typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("daet_heritage_sync") : null;

    if (bc) {
      bc.onmessage = (event) => {
        if (
          event.data?.type === "CONTENT_UPDATED" ||
          event.data?.type === "SITES_UPDATED" ||
          event.data?.type === "LOGO_UPDATED"
        ) {
          router.refresh();
        }
      };
    }

    // 2. Tab focus & visibility change listener (ensures fresh data when user switches back to this tab)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    // 3. Supabase Realtime subscription for multi-user / cross-device updates
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("daet_heritage_realtime_sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => {
          router.refresh();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "heritage_sites" }, () => {
          router.refresh();
        })
        .subscribe();
    } catch (err) {
      console.warn("Realtime subscription initialization error:", err);
    }

    return () => {
      bc?.close();
      window.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [router]);

  return null;
}

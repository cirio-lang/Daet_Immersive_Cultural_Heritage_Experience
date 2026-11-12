"use client";

import { useEffect, useRef, useState } from "react";

import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { SYSTEM, Viewer } from "@photo-sphere-viewer/core";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import "@photo-sphere-viewer/core/index.css";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Cache as ThreeCache } from "three";

import { Button } from "@/components/ui/button";

interface PhotoSphereViewerImplProps {
  panoramaUrl: string;
  siteTitle?: string;
  className?: string;
  autoRotate?: boolean;
}

export function PhotoSphereViewerImpl({
  panoramaUrl,
  siteTitle = "360° Panoramic View",
  className = "h-full w-full",
  autoRotate = true,
}: PhotoSphereViewerImplProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !panoramaUrl) return;

    let isMounted = true;
    let initTimer: NodeJS.Timeout | null = null;
    let timeoutTimer: NodeJS.Timeout | null = null;
    let handleContextLost: ((event: Event) => void) | null = null;
    let canvasEl: HTMLCanvasElement | null = null;

    setLoadError(null);
    setIsLoading(true);
    setLoadingProgress(null);

    // Activity-based timeout: resets whenever download progress occurs
    const resetTimeout = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      timeoutTimer = setTimeout(() => {
        if (!isMounted) return;
        setIsLoading(false);
        const errorMessage =
          "Unable to load the 360° image. The file may be too large, in an unsupported format, or the connection timed out. Try resizing the image to 4096×2048 or smaller.";
        setLoadError(errorMessage);

        console.error(
          `⏱️ [360° Panorama Viewer Timeout]\n` +
            `• Site / View Title: "${siteTitle}"\n` +
            `• Panorama URL: ${panoramaUrl}\n` +
            `• Error: Viewer timed out waiting for 'ready' or 'panorama-loaded' events.\n` +
            `• Common Causes:\n` +
            `  1. Image resolution exceeds GPU/WebGL max texture size (e.g. 8192px on unsupported GPUs).\n` +
            `  2. Image format or equirectangular projection header corrupted.\n` +
            `  3. Network or storage download stalled.\n` +
            `  4. Three.js FileLoader request deduplication blocked a new load.\n` +
            `• Recommended: Resize image to 4096×2048 JPEG or smaller.`,
        );

        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch {
            // ignore
          }
          viewerRef.current = null;
        }
      }, 25000);
    };

    resetTimeout();

    // CRITICAL: Debounce viewer initialization by 60ms.
    // In React 18/19 dev mode (StrictMode), React mounts, immediately unmounts,
    // and remounts components. If Viewer is created synchronously on mount 1,
    // unmount 1 aborts the fetch. Mount 2 starts while the aborted fetch is still
    // in Three.js's module-level `loading[url]` map. Three.js delivers AbortError
    // to mount 2, causing PSV to silently stop loading without firing any event.
    // Debouncing ensures mount 1 is cancelled before it ever touches Three.js!
    initTimer = setTimeout(() => {
      if (!isMounted || !containerRef.current) return;

      try {
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch {
            // ignore cleanup error
          }
          viewerRef.current = null;
        }

        const plugins: any[] = [
          [
            GyroscopePlugin,
            {
              touchmove: true,
            },
          ],
        ];

        if (autoRotate) {
          plugins.push([
            AutorotatePlugin,
            {
              autorotateSpeed: "1rpm",
              autostartDelay: 1500,
              autostartOnIdle: true,
            },
          ]);
        }

        // Use cache-busting URL on retry to bypass any stuck Three.js loader entries
        const targetUrl =
          retryCount > 0
            ? `${panoramaUrl}${panoramaUrl.includes("?") ? "&" : "?"}_r=${retryCount}_${Date.now()}`
            : panoramaUrl;

        const viewer = new Viewer({
          container: containerRef.current,
          panorama: targetUrl,
          caption: siteTitle,
          loadingTxt: "",
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          withCredentials: false,
          plugins,
          navbar: ["autorotate", "zoom", "move", "gyroscope", "fullscreen", "caption"],
        });

        viewerRef.current = viewer;

        const handleSuccess = () => {
          if (timeoutTimer) clearTimeout(timeoutTimer);
          if (isMounted) {
            setIsLoading(false);
            setLoadingProgress(null);
          }
        };

        viewer.addEventListener("ready", handleSuccess);
        viewer.addEventListener("panorama-loaded", handleSuccess);

        // Also check if viewer state is already ready or loadingPromise resolves
        if (viewer.state?.ready) {
          handleSuccess();
        } else if (viewer.state?.loadingPromise) {
          viewer.state.loadingPromise
            .then((res: unknown) => {
              if (res !== false) {
                handleSuccess();
              }
            })
            .catch(() => {
              // Handled by viewer event listeners
            });
        }

        // Track loading progress and refresh the timeout so active downloads never time out
        viewer.addEventListener("load-progress", (e: any) => {
          const progress = e?.progress;
          if (progress !== undefined && isMounted) {
            resetTimeout();
            setLoadingProgress(Math.round(progress));
          }
        });

        viewer.addEventListener("panorama-error", (e: any) => {
          if (timeoutTimer) clearTimeout(timeoutTimer);
          if (isMounted) {
            const err = e?.error || e;
            const errMsg = err instanceof Error ? err.message : String(err);
            const errName = err instanceof Error ? err.name : "PanoramaLoadError";

            console.error(
              `❌ [360° Panorama Viewer Load Failure]\n` +
                `• Site / View Title: "${siteTitle}"\n` +
                `• URL: ${targetUrl}\n` +
                `• Error: ${errName} — ${errMsg}`,
              err,
            );

            setLoadError(errMsg || "Failed to load 360° panorama image.");
            setIsLoading(false);
          }
        });

        // Detect WebGL context loss
        canvasEl = containerRef.current.querySelector("canvas");
        handleContextLost = (event: Event) => {
          event.preventDefault();
          if (timeoutTimer) clearTimeout(timeoutTimer);
          console.error(
            `🚨 [WebGL Context Lost]\n` + `• Site / View: "${siteTitle}"\n` + `• Panorama URL: ${targetUrl}`,
          );
          if (isMounted) {
            setLoadError(
              "WebGL graphics context was lost. The image resolution may be too high for this device's GPU.",
            );
            setIsLoading(false);
          }
        };
        canvasEl?.addEventListener("webglcontextlost", handleContextLost);
      } catch (err: unknown) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (isMounted) {
          console.error(`❌ [360° Panorama Initialization Error]:`, err);
          setLoadError(err instanceof Error ? err.message : "Failed to load 360° panorama image");
          setIsLoading(false);
        }
      }
    }, 60);

    return () => {
      isMounted = false;
      if (initTimer) clearTimeout(initTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (canvasEl && handleContextLost) {
        canvasEl.removeEventListener("webglcontextlost", handleContextLost);
      }
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          // ignore
        }
        viewerRef.current = null;
      }
    };
  }, [panoramaUrl, siteTitle, autoRotate, retryCount]);

  if (loadError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-black/90 p-6 text-center text-white">
        <AlertCircle className="mb-2 size-8 text-amber-500" />
        <p className="font-serif text-sm">Unable to render 360° Panorama</p>
        <p className="mt-1 max-w-sm text-xs text-neutral-400">{loadError}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-1 text-xs"
          onClick={() => {
            setLoadError(null);
            setIsLoading(true);
            setRetryCount((prev) => prev + 1);
          }}
        >
          <RefreshCw className="size-3" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden [&_.psv-loader-container]:!hidden [&_.psv-loader]:!hidden ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#080d17]/80 px-4 py-2 font-mono text-xs text-[#e5c98b]">
            <span className="size-2 animate-ping rounded-full bg-[#c5a059]" />
            <span>
              Loading 360° Panorama...
              {loadingProgress !== null ? ` ${loadingProgress}%` : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

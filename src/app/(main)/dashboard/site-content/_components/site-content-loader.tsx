"use client";

import dynamic from "next/dynamic";

import type { SiteContent } from "@/types/site-content";

const SiteContentForm = dynamic(() => import("./site-content-form").then((mod) => mod.SiteContentForm), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
      <div className="grid gap-6">
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  ),
});

interface SiteContentLoaderProps {
  initialContent: SiteContent;
}

export function SiteContentLoader({ initialContent }: SiteContentLoaderProps) {
  return <SiteContentForm initialContent={initialContent} />;
}

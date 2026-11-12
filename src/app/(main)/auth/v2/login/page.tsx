import { Suspense } from "react";

import Link from "next/link";

import { ArrowLeft, ShieldCheck } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";

import { LoginForm } from "../../_components/login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginV2() {
  return (
    <div className="relative flex min-h-full w-full flex-col justify-between p-6 sm:p-10">
      {/* Top Header Link */}
      <div className="flex items-center justify-between w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-[#c5a059]/40 hover:text-foreground backdrop-blur-md shadow-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Public Site</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="mx-auto my-auto flex w-full flex-col justify-center space-y-6 py-8 sm:w-[380px]">
        <div className="space-y-2.5 text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 px-3 py-1 text-[#c5a059]">
            <ShieldCheck className="size-3.5" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">Administrator Access</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Sign in to Daet Heritage</h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Enter your credentials to access the cultural curation and telemetry dashboard.
          </p>
        </div>

        <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-md bg-muted/20" />}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="flex w-full items-center justify-between text-xs text-muted-foreground pt-4">
        <div>{APP_CONFIG.copyright}</div>
        <div className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/80">
          Daet, Camarines Norte
        </div>
      </div>
    </div>
  );
}

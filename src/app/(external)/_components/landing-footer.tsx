"use client";

import Link from "next/link";

import { Landmark, Lock } from "lucide-react";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface LandingFooterProps {
  logoUrl?: string | null;
}

export function LandingFooter({ logoUrl }: LandingFooterProps = {}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <footer ref={ref} className="border-t border-[#c5a059]/20 bg-[#080d17] py-16 text-[#f5f0e6]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand & Mission */}
          <div
            className="scroll-reveal anim-fade-up md:col-span-2"
            data-visible={isVisible}
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full border border-[#c5a059]/40 bg-[#0c121e] text-[#c5a059] overflow-hidden p-1.5">
                {logoUrl ? (
                  <img src={logoUrl} alt="Daet Heritage Logo" className="size-full object-contain" />
                ) : (
                  <Landmark className="size-4" strokeWidth={1.25} />
                )}
              </div>
              <span className="font-serif text-lg font-normal tracking-[0.12em] text-[#faf7f2]">
                Daet Heritage Experience
              </span>
            </div>
            <p className="mt-4 max-w-md font-sans text-xs font-light leading-relaxed text-[#a89d8d]">
              A digital preservation and immersive discovery initiative dedicated to the historical and cultural
              landmarks of the Municipality of Daet, Province of Camarines Norte. Powered by interactive 360° virtual
              tours and on-site QR code field access.
            </p>
            <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-[#c5a059] uppercase">
              Bayan ng Daet • Kabisera ng Camarines Norte • Home of the First Rizal Monument
            </p>
          </div>

          {/* Navigation Links */}
          <div className="scroll-reveal anim-fade-up" data-visible={isVisible} style={{ animationDelay: "120ms" }}>
            <h3 className="font-mono text-[10px] font-medium tracking-[0.25em] text-[#c5a059] uppercase">
              Exhibition Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs font-light">
              <li>
                <Link href="/#about" className="text-[#cfc5b5] transition-colors hover:text-[#e5c98b]">
                  Curatorial Introduction
                </Link>
              </li>
              <li>
                <Link href="/#directory" className="text-[#cfc5b5] transition-colors hover:text-[#e5c98b]">
                  The Heritage Directory
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-[#cfc5b5] transition-colors hover:text-[#e5c98b]">
                  Historical Archives
                </Link>
              </li>
            </ul>
          </div>

          {/* Cultural Heritage Partners */}
          <div className="scroll-reveal anim-fade-up" data-visible={isVisible} style={{ animationDelay: "240ms" }}>
            <h3 className="font-mono text-[10px] font-medium tracking-[0.25em] text-[#c5a059] uppercase">
              Institutional Heritage
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs font-light text-[#a89d8d]">
              <li>Local Government Unit of Daet</li>
              <li>Province of Camarines Norte</li>
              <li>National Historical Commission of the Philippines</li>
              <li>Diocese of Daet Ecclesiastical Archives</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with discreet Staff Sign In */}
        <div
          className="scroll-reveal anim-fade-up mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#c5a059]/15 pt-6 text-[11px] font-light text-[#8c8273] sm:flex-row"
          data-visible={isVisible}
          style={{ animationDelay: "360ms" }}
        >
          <p>© {new Date().getFullYear()} Daet Immersive Cultural Heritage Experience. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span>Municipality of Daet, Camarines Norte</span>
            <span>•</span>
            <Link
              href="/auth/v2/login"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-[#8c8273] transition-colors hover:text-[#c5a059]"
            >
              <Lock className="size-2.5" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

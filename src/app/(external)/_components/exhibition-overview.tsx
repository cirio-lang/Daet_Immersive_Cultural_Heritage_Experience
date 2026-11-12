"use client";

import { Compass, Eye, Landmark, QrCode, ScrollText, Sparkles } from "lucide-react";

import { DEFAULT_CHAPTER_1_HIGHLIGHTS } from "@/data/default-site-content";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type { SiteContent } from "@/types/site-content";

interface ExhibitionOverviewProps {
  content: SiteContent;
}

const HIGHLIGHT_ICONS = [Landmark, ScrollText, Compass, Eye];

export function ExhibitionOverview({ content }: ExhibitionOverviewProps) {
  const highlights =
    content.chapter_1_highlights && content.chapter_1_highlights.length > 0
      ? content.chapter_1_highlights
      : DEFAULT_CHAPTER_1_HIGHLIGHTS;

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  return (
    <section
      id="about"
      className="relative border-y border-[#c5a059]/20 bg-[#fbf9f4] py-24 text-[#221c16] sm:py-32 dark:bg-[#0a0f1d] dark:text-[#f5f0e6]"
    >
      {/* Background Subtle Texture Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#8d6b28_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] dark:bg-[radial-gradient(#c5a059_1px,transparent_1px)] dark:opacity-5" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Plaque Header */}
        <div ref={headerRef} className="mx-auto max-w-3xl text-center">
          <p
            className="scroll-reveal anim-fade-up text-[11px] font-medium tracking-[0.3em] text-[#8d6b28] uppercase dark:text-[#c5a059]"
            data-visible={headerVisible}
          >
            Curatorial Introduction • Chapter I
          </p>
          <h2
            className="scroll-reveal anim-fade-up mt-3 font-serif text-3xl font-normal tracking-tight text-[#221c16] sm:text-4xl lg:text-5xl dark:text-[#f5f0e6]"
            data-visible={headerVisible}
            style={{ animationDelay: "100ms" }}
          >
            {content.chapter_1_title}
          </h2>
          <div
            className="scroll-reveal anim-scale-in mx-auto my-6 flex items-center justify-center gap-3"
            data-visible={headerVisible}
            style={{ animationDelay: "200ms" }}
          >
            <span className="h-px w-12 bg-[#8d6b28]/30 dark:bg-[#c5a059]/40" />
            <span className="size-1.5 rotate-45 border border-[#8d6b28] bg-[#8d6b28]/20 dark:border-[#c5a059] dark:bg-[#c5a059]/30" />
            <span className="h-px w-12 bg-[#8d6b28]/30 dark:bg-[#c5a059]/40" />
          </div>
          <p
            className="scroll-reveal anim-fade-up font-sans text-sm font-light leading-relaxed text-[#554a3d] sm:text-base whitespace-pre-line dark:text-[#c3b9aa]"
            data-visible={headerVisible}
            style={{ animationDelay: "300ms" }}
          >
            {content.chapter_1_body}
          </p>
        </div>

        {/* Thematic Exhibition Highlight Pairs (Dynamic Museum Exhibit Style) */}
        <div ref={gridRef} className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {highlights.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length] || Sparkles;
            return (
              <div
                key={index}
                className="scroll-reveal anim-fade-left group relative border-l border-[#8d6b28]/30 pl-6 sm:pl-8 transition-colors duration-300 hover:border-[#8d6b28] dark:border-[#c5a059]/30 dark:hover:border-[#c5a059]"
                data-visible={gridVisible}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="size-5 text-[#8d6b28] dark:text-[#c5a059]" strokeWidth={1.25} />
                  <span className="text-[11px] font-medium tracking-[0.25em] text-[#8d6b28] uppercase dark:text-[#c5a059]">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#221c16] dark:text-[#f5f0e6]">{item.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-[#554a3d] dark:text-[#c3b9aa]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

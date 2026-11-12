"use client";

import Link from "next/link";

import { ArrowRight, BookOpen, Camera, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type { SiteContent } from "@/types/site-content";

interface ArchivalShowcaseProps {
  content: SiteContent;
}

export function ArchivalShowcase({ content }: ArchivalShowcaseProps) {
  const plate1Image = content.chapter_2_plate_1_image || "/images/first-rizal-monument.jpg";
  const plate2Image = content.chapter_2_plate_2_image || "/images/daet-cathedral.jpg";

  const { ref: textRef, isVisible: textVisible } = useScrollReveal({ threshold: 0.15 });
  const { ref: imagesRef, isVisible: imagesVisible } = useScrollReveal({
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px",
  });

  return (
    <section className="relative border-b border-[#c5a059]/20 bg-[#f7f3eb] py-24 text-[#221c16] sm:py-32 dark:bg-[#101726] dark:text-[#f3ede1]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Left Column: Curatorial Essay & Large Serif Heading */}
          <div ref={textRef} className="lg:col-span-5 space-y-6">
            <div className="scroll-reveal anim-fade-left inline-flex items-center gap-2" data-visible={textVisible}>
              <span className="h-px w-6 bg-[#c5a059]" />
              <span className="text-[11px] font-medium tracking-[0.28em] text-[#9b7327] dark:text-[#c5a059] uppercase">
                Visual Exhibition • Chapter II
              </span>
            </div>

            <h2
              className="scroll-reveal anim-fade-left font-serif text-3xl font-normal tracking-tight text-[#221c16] sm:text-4xl lg:text-5xl dark:text-[#f7f3eb] leading-[1.15]"
              data-visible={textVisible}
              style={{ animationDelay: "120ms" }}
            >
              {content.chapter_2_title}
            </h2>

            <p
              className="scroll-reveal anim-fade-left font-sans text-sm font-light leading-relaxed text-[#5c5042] dark:text-[#bbb1a2] sm:text-base whitespace-pre-line"
              data-visible={textVisible}
              style={{ animationDelay: "240ms" }}
            >
              {content.chapter_2_body}
            </p>

            <blockquote
              className="scroll-reveal anim-fade-up border-l-2 border-[#c5a059] pl-4 italic text-sm text-[#483d31] dark:text-[#cfc5b5]"
              data-visible={textVisible}
              style={{ animationDelay: "380ms" }}
            >
              &ldquo;{content.chapter_2_quote}&rdquo;
              <footer className="mt-1 font-sans text-[11px] not-italic font-medium tracking-wider text-[#9b7327] dark:text-[#c5a059] uppercase">
                {content.chapter_2_quote_attribution || "— Historical Inscription, Daet Revolutionary Annals"}
              </footer>
            </blockquote>

            <div
              className="scroll-reveal anim-fade-up pt-2"
              data-visible={textVisible}
              style={{ animationDelay: "480ms" }}
            >
              <Button
                asChild
                variant="outline"
                className="gap-2 rounded-none border-[#9b7327]/40 bg-transparent text-xs tracking-[0.18em] uppercase text-[#735316] hover:bg-[#9b7327]/10 hover:border-[#9b7327] dark:border-[#c5a059]/40 dark:text-[#e8d5b5] dark:hover:bg-[#c5a059]/10"
              >
                <Link href="#directory">
                  <span>Browse Full Collection</span>
                  <ArrowRight className="size-3.5" strokeWidth={1.5} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Editorial Visual Spread with Museum Plaques */}
          <div ref={imagesRef} className="lg:col-span-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Image Plate 1 */}
            <div
              className="scroll-reveal anim-fade-right group relative overflow-hidden border border-[#c5a059]/30 bg-[#ede7dc] dark:bg-[#161f31] p-3 shadow-sm transition-all duration-500 hover:border-[#c5a059] hover:shadow-md"
              data-visible={imagesVisible}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                <img
                  src={plate1Image}
                  alt="Archival View Plate I"
                  className="h-full w-full object-cover grayscale-[15%] sepia-[10%] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <span className="absolute top-2 left-2 rounded-none bg-black/70 px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#e5c98b] uppercase backdrop-blur-xs">
                  Plate I
                </span>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="font-serif text-sm font-normal">
                    {content.chapter_2_plate_1_title || "First Rizal Monument"}
                  </p>
                  <p className="text-[10px] text-[#e8d5b5] font-light">
                    {content.chapter_2_plate_1_location || "Barangay Poblacion, Daet"}
                  </p>
                </div>
              </div>
              <div className="pt-2 px-1 text-[11px] text-[#6b5f4f] dark:text-[#a89d8d] leading-relaxed whitespace-pre-line">
                {content.chapter_2_plate_1_caption}
              </div>
            </div>

            {/* Image Plate 2 */}
            <div
              className="scroll-reveal anim-fade-right group relative overflow-hidden border border-[#c5a059]/30 bg-[#ede7dc] dark:bg-[#161f31] p-3 shadow-sm transition-all duration-500 hover:border-[#c5a059] hover:shadow-md sm:mt-8"
              data-visible={imagesVisible}
              style={{ animationDelay: "200ms" }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                <img
                  src={plate2Image}
                  alt="Archival View Plate II"
                  className="h-full w-full object-cover grayscale-[15%] sepia-[10%] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <span className="absolute top-2 left-2 rounded-none bg-black/70 px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#e5c98b] uppercase backdrop-blur-xs">
                  Plate II
                </span>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="font-serif text-sm font-normal">
                    {content.chapter_2_plate_2_title || "Cathedral of San Juan Bautista"}
                  </p>
                  <p className="text-[10px] text-[#e8d5b5] font-light">
                    {content.chapter_2_plate_2_location || "Diocese of Daet"}
                  </p>
                </div>
              </div>
              <div className="pt-2 px-1 text-[11px] text-[#6b5f4f] dark:text-[#a89d8d] leading-relaxed whitespace-pre-line">
                {content.chapter_2_plate_2_caption}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

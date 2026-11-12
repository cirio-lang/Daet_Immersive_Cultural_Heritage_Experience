"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { ArrowDown, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/types/site-content";

interface HeroSectionProps {
  content: SiteContent;
}

export function HeroSection({ content }: HeroSectionProps) {
  const heroImageSrc = content.hero_image_url || "/images/hero-bg.jpg";
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Trigger entrance animations after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parallax scroll effect on the background image
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.35;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden border-b border-[#c5a059]/20 bg-[#080d17] py-28 sm:py-36 lg:py-48"
    >
      {/*
        Full-bleed cinematic background photo with deep museum vignette overlay.
        Parallax: image shifts slower than scroll for depth effect.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroImageSrc}
          alt="Daet Historical Architecture"
          className="h-[120%] w-full object-cover object-center brightness-[0.45] contrast-[1.05] transition-transform duration-100 ease-out will-change-transform"
          style={{ transform: `translateY(-${parallaxOffset}px)` }}
        />
        {/* Theatrical Vignette Overlays & Subtle Ambient Warm Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080d17]/85 via-[#080d17]/45 to-[#080d17]" />
        <div className="absolute inset-0 bg-radial-[at_50%_35%] from-[#c5a059]/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Centered Museum Crest & Seal Treatment */}
        <div
          className="mx-auto mb-8 flex flex-col items-center gap-3.5 scroll-reveal anim-scale-in"
          data-visible={isLoaded}
        >
          <div className="flex size-14 items-center justify-center rounded-full border border-[#c5a059]/50 bg-[#080d17]/80 shadow-lg shadow-black/60 backdrop-blur-md overflow-hidden p-2.5">
            {content.logo_url ? (
              <img src={content.logo_url} alt="Daet Heritage Crest" className="size-full object-contain" />
            ) : (
              <Landmark className="size-6 text-[#c5a059]" strokeWidth={1.25} />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#c5a059]/40" />
            <span className="font-mono text-[10px] font-medium tracking-[0.32em] text-[#c5a059] uppercase">
              {content.hero_badge_text}
            </span>
            <span className="h-px w-8 bg-[#c5a059]/40" />
          </div>
        </div>

        {/* Large Elegant Serif Headline */}
        <h1
          className="scroll-reveal anim-hero-text font-serif text-4xl font-normal tracking-tight text-[#faf7f2] sm:text-6xl lg:text-7xl leading-[1.12]"
          data-visible={isLoaded}
          style={{ animationDelay: "200ms" }}
        >
          {content.hero_title}
        </h1>

        {/* Curatorial Subtitle with Expansive Spacing */}
        <p
          className="scroll-reveal anim-fade-up mx-auto mt-8 max-w-2xl font-sans text-base font-light leading-relaxed text-[#cfc5b5] sm:text-lg"
          data-visible={isLoaded}
          style={{ animationDelay: "450ms" }}
        >
          {content.hero_description}
        </p>

        {/* Outlined Museum CTA Button */}
        <div
          className="scroll-reveal anim-fade-up mt-12 flex flex-wrap items-center justify-center gap-4"
          data-visible={isLoaded}
          style={{ animationDelay: "650ms" }}
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2.5 rounded-none border border-[#c5a059]/60 bg-[#080d17]/60 px-8 py-3 text-xs tracking-[0.22em] uppercase text-[#f5f0e6] backdrop-blur-md transition-all duration-300 hover:border-[#c5a059] hover:bg-[#c5a059]/15 hover:text-white hover:shadow-lg hover:shadow-[#c5a059]/10"
          >
            <Link href="#about">
              <span>Enter Exhibition</span>
              <ArrowDown
                className="size-3.5 text-[#c5a059]"
                strokeWidth={1.5}
                style={{ animation: "gentleFloat 2.5s ease-in-out infinite" }}
              />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="ghost"
            className="rounded-none px-6 text-xs tracking-[0.2em] uppercase text-[#c3b9aa] hover:bg-white/5 hover:text-[#f5f0e6] transition-colors"
          >
            <Link href="#directory">View Landmark Catalog</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

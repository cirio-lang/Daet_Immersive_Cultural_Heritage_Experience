"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Landmark } from "lucide-react";

// import { ThemeSwitcher } from "@/app/(main)/dashboard/_components/header/theme-switcher";
import { Button } from "@/components/ui/button";

interface LandingNavbarProps {
  logoUrl?: string | null;
}

export function LandingNavbar({ logoUrl }: LandingNavbarProps = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      // If user scrolls back up near the top, clean up lingering section hash from the address bar
      if (window.scrollY < 250 && window.location.hash) {
        history.replaceState(null, "", window.location.pathname);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        const navHeight = 72;
        const targetTop = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
        history.replaceState(null, "", `#${targetId}`);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#c5a059]/30 bg-[#080d17]/95 shadow-lg shadow-black/40 backdrop-blur-xl"
          : "border-b border-[#c5a059]/15 bg-[#080d17]/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Museum Identity Crest */}
        <Link href="/" className="group flex items-center gap-3.5 transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-full border border-[#c5a059]/40 bg-[#0c121e] text-[#c5a059] transition-transform duration-300 group-hover:scale-105 overflow-hidden p-1.5">
            {logoUrl ? (
              <img src={logoUrl} alt="Daet Heritage Logo" className="size-full object-contain" />
            ) : (
              <Landmark className="size-4" strokeWidth={1.25} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-normal tracking-[0.12em] text-[#faf7f2] sm:text-lg">
              DAET HERITAGE
            </span>
            <span className="font-mono text-[9px] tracking-[0.28em] text-[#c5a059] uppercase">
              MUSEUM &amp; ARCHIVES
            </span>
          </div>
        </Link>

        {/* Tracked-out Minimal Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#about"
            onClick={(e) => handleNavClick(e, "about")}
            className="text-xs font-medium tracking-[0.18em] text-[#c3b9aa] uppercase transition-colors hover:text-[#e5c98b]"
          >
            Curatorial Essay
          </Link>
          <Link
            href="/#directory"
            onClick={(e) => handleNavClick(e, "directory")}
            className="text-xs font-medium tracking-[0.18em] text-[#c3b9aa] uppercase transition-colors hover:text-[#e5c98b]"
          >
            Landmark Directory
          </Link>
        </nav>

        {/* Minimal Controls */}
        <div className="flex items-center gap-3">
          {/* Theme switcher toggle button commented out for main public website (defaulted to dark mode); preserved for future reactivation */}
          {/* <ThemeSwitcher /> */}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-none border border-[#c5a059]/40 bg-transparent px-4 text-[11px] tracking-[0.2em] uppercase text-[#e5c98b] hover:border-[#c5a059] hover:bg-[#c5a059]/10"
          >
            <Link href="/#directory" onClick={(e) => handleNavClick(e, "directory")}>
              <span>Catalog</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

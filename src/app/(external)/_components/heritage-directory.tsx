"use client";

import { useMemo, useState } from "react";

import { Camera, Filter, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { CATEGORY_LABELS, type HeritageCategory, type HeritageSite } from "@/types/heritage";

import { HeritageCard } from "./heritage-card";

interface HeritageDirectoryProps {
  sites: HeritageSite[];
  isUsingFallback?: boolean;
}

export function HeritageDirectory({ sites, isUsingFallback = false }: HeritageDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.15 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({
    threshold: 0.05,
    rootMargin: "0px 0px -30px 0px",
  });

  // Categories present in the current dataset
  const availableCategories = useMemo(() => {
    const cats = new Set(sites.map((s) => s.category));
    return Array.from(cats);
  }, [sites]);

  // Filtered sites based on category and search query
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesCategory = selectedCategory === "all" || site.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      return matchesCategory && matchesSearch;
    });
  }, [sites, selectedCategory, searchQuery]);

  return (
    <section id="directory" className="container mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Section Header with Museum Plaque Eyebrow and Serif Title */}
      <div
        ref={headerRef}
        className="flex flex-col justify-between gap-6 border-b border-[#c5a059]/20 pb-10 md:flex-row md:items-end"
      >
        <div className="max-w-2xl">
          <div className="scroll-reveal anim-fade-up mb-3 inline-flex items-center gap-2" data-visible={headerVisible}>
            <span className="font-mono text-[10px] font-medium tracking-[0.3em] text-[#8d6b28] uppercase dark:text-[#c5a059]">
              Permanent Collection • Digital Catalog
            </span>
            {isUsingFallback && (
              <span className="inline-flex items-center gap-1 rounded-none border border-[#8d6b28]/30 bg-[#8d6b28]/10 px-2 py-0.5 font-mono text-[9px] text-[#8d6b28] uppercase tracking-wider dark:border-[#c5a059]/30 dark:bg-[#c5a059]/10 dark:text-[#c5a059]">
                <Sparkles className="size-2.5" />
                Featured Records
              </span>
            )}
          </div>
          <h2
            className="scroll-reveal anim-fade-up font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            data-visible={headerVisible}
            style={{ animationDelay: "100ms" }}
          >
            The Heritage Directory
          </h2>
          <p
            className="scroll-reveal anim-fade-up mt-3 text-sm font-light leading-relaxed text-muted-foreground sm:text-base"
            data-visible={headerVisible}
            style={{ animationDelay: "200ms" }}
          >
            Explore the catalog of gazetted historical monuments, ecclesiastical structures, and civic landmarks in the
            Municipality of Daet, Camarines Norte.
          </p>
        </div>

        {/* Total Count Display */}
        <div
          className="scroll-reveal anim-fade-up flex items-center gap-2"
          data-visible={headerVisible}
          style={{ animationDelay: "300ms" }}
        >
          <span className="font-mono text-xs tracking-wider text-[#8d6b28] border border-[#8d6b28]/30 bg-[#8d6b28]/5 px-3 py-1 dark:text-[#c5a059] dark:border-[#c5a059]/30 dark:bg-[#c5a059]/5">
            {filteredSites.length} of {sites.length} Catalogued Sites
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="mt-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
        {/* Category Pills */}
        <div className="flex w-full flex-wrap items-center gap-2 overflow-x-auto pb-2 sm:w-auto sm:pb-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-none text-[11px] font-medium tracking-[0.14em] uppercase transition-all ${
              selectedCategory === "all"
                ? "border-[#c5a059] bg-[#c5a059]/15 text-[#9b7327] dark:text-[#e5c98b]"
                : "border-border/60 text-muted-foreground hover:border-[#c5a059]/40 hover:text-foreground"
            }`}
          >
            All Entries ({sites.length})
          </Button>

          {availableCategories.map((category) => {
            const label = CATEGORY_LABELS[category as HeritageCategory] || category;
            const count = sites.filter((s) => s.category === category).length;
            const isSelected = selectedCategory === category;

            return (
              <Button
                key={category}
                size="sm"
                variant="outline"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-none text-[11px] font-medium tracking-[0.14em] uppercase transition-all ${
                  isSelected
                    ? "border-[#c5a059] bg-[#c5a059]/15 text-[#9b7327] dark:text-[#e5c98b]"
                    : "border-border/60 text-muted-foreground hover:border-[#c5a059]/40 hover:text-foreground"
                }`}
              >
                {label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.25}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalogue by name or barangay..."
            className="h-10 w-full rounded-none border border-border/70 bg-background pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Sites Grid */}
      <div ref={gridRef} className="mt-10">
        {filteredSites.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site, index) => (
              <HeritageCard key={site.id} site={site} index={index} isVisible={gridVisible} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#c5a059]/30 bg-card/40 p-12 text-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-[#c5a059]/10 text-[#c5a059]">
                  <Filter className="size-4" strokeWidth={1.25} />
                </EmptyMedia>
                <EmptyTitle className="font-serif text-xl font-normal text-foreground">
                  No Catalogue Entries Found
                </EmptyTitle>
                <EmptyDescription className="text-xs font-light leading-relaxed">
                  No landmarks match your search query or selected classification. Please adjust your criteria or reset
                  the filter.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                size="sm"
                variant="outline"
                className="rounded-none border-[#c5a059]/40 text-xs tracking-wider uppercase text-[#c5a059] hover:bg-[#c5a059]/10"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset Catalogue Filter
              </Button>
            </Empty>
          </div>
        )}
      </div>

      {/* Exhibition Field Note */}
      {isUsingFallback && (
        <div className="mt-16 border-t border-[#c5a059]/20 pt-8 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059]">
              <Camera className="size-3.5" strokeWidth={1.25} />
            </div>
            <h3 className="font-serif text-base font-normal text-foreground">
              Ongoing Field Photogrammetry &amp; Student Research
            </h3>
            <p className="text-xs font-light leading-relaxed text-muted-foreground">
              Field photography and 360° virtual captures are currently being collected by local researchers and student
              documenters across Camarines Norte. Verified entries will update dynamically upon archival publication.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

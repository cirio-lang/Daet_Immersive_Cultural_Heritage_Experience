import Link from "next/link";

import { ArrowUpRight, Eye, MapPin } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS, type HeritageSite } from "@/types/heritage";

import { HeritageImage } from "./heritage-image";

interface HeritageCardProps {
  site: HeritageSite;
  index?: number;
  isVisible?: boolean;
}

export function HeritageCard({ site, index = 0, isVisible = true }: HeritageCardProps) {
  const categoryLabel = CATEGORY_LABELS[site.category] || site.category;

  return (
    <Card
      className="scroll-reveal anim-fade-up group flex h-full flex-col overflow-hidden rounded-none border border-[#c5a059]/25 bg-card/85 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c5a059] hover:shadow-xl hover:shadow-black/20"
      data-visible={isVisible}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Cover Media with AspectRatio and Delicate Frame */}
      <div className="relative overflow-hidden bg-muted border-b border-[#c5a059]/20">
        <AspectRatio ratio={16 / 10}>
          <HeritageImage
            src={site.cover_image_url}
            alt={site.title}
            category={site.category}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </AspectRatio>

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-75" />

        {/* Museum Plaque Category Tag */}
        <div className="absolute top-3 left-3">
          <span className="rounded-none border border-[#c5a059]/50 bg-black/75 px-2.5 py-0.5 font-mono text-[9px] font-medium tracking-[0.22em] text-[#e5c98b] uppercase backdrop-blur-xs">
            {categoryLabel}
          </span>
        </div>

        {/* 360 View Tag */}
        {site.panorama_360_url && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-none border border-[#c5a059]/50 bg-[#080d17]/80 px-2 py-0.5 font-mono text-[9px] tracking-wider text-[#e5c98b] backdrop-blur-xs">
              <Eye className="size-2.5 text-[#c5a059]" strokeWidth={1.5} />
              <span>360° View</span>
            </span>
          </div>
        )}

        {/* Floating Meta Plaque on Bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-[#e8d5b5]">
          <div className="flex items-center gap-1.5 font-sans text-[11px] drop-shadow-md">
            <MapPin className="size-3 text-[#c5a059]" strokeWidth={1.5} />
            <span>{site.barangay}, Daet</span>
          </div>
          {site.year_built && <span className="font-mono text-[10px] text-[#c5a059]">Circa {site.year_built}</span>}
        </div>
      </div>

      {/* Card Content with Serif Heading */}
      <CardHeader className="gap-2 pt-5 pb-3">
        <CardTitle className="line-clamp-2 font-serif text-xl font-normal text-foreground transition-colors duration-300 group-hover:text-[#c5a059]">
          <Link href={`/sites/${site.slug}`} className="focus:outline-none">
            {site.title}
          </Link>
        </CardTitle>

        {site.short_description && (
          <CardDescription className="line-clamp-3 text-xs leading-relaxed font-light text-muted-foreground">
            {site.short_description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1" />

      {/* Card Footer with Outlined Accent */}
      <CardFooter className="border-t border-[#c5a059]/15 bg-muted/20 pt-3 pb-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="group/btn w-full justify-between rounded-none px-2 text-[11px] font-medium tracking-[0.15em] uppercase text-[#c5a059] transition-colors hover:bg-transparent hover:text-[#9b7327] dark:hover:text-[#e5c98b]"
        >
          <Link href={`/sites/${site.slug}`}>
            <span>View Catalogue Entry &amp; 360° Tour</span>
            <ArrowUpRight
              className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5"
              strokeWidth={1.25}
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

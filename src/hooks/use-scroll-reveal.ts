"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  /** Visibility threshold (0-1). Default: 0.15 */
  threshold?: number;
  /** Root margin for earlier/later trigger. Default: "0px 0px -60px 0px" */
  rootMargin?: string;
  /** Only trigger once. Default: true */
  triggerOnce?: boolean;
}

/**
 * Hook that uses IntersectionObserver to detect when an element scrolls into
 * the viewport, returning a ref to attach and a boolean `isVisible`.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  triggerOnce = true,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Skip animation and show immediately if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

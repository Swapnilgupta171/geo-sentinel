"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to observe elements with class 'reveal' and add 'visible'
 * when they enter the viewport. CSS handles the transition.
 */
export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      container.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    container.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

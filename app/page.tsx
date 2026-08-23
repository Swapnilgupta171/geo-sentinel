"use client";

import { useState, useCallback } from "react";
import { useScrollReveal } from "./components/useScrollReveal";
import { Hero } from "./components/Hero";
import { ProblemMockup } from "./components/ProblemMockup";
import { StatsStrip } from "./components/StatsStrip";
import { LogoStrip } from "./components/LogoStrip";
import { HowItWorks } from "./components/HowItWorks";
import { ProductDeepDive } from "./components/ProductDeepDive";
import { WhoItsFor } from "./components/WhoItsFor";
import { Positioning } from "./components/Positioning";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { ResultsDrawer } from "./components/ResultsDrawer";

export default function Home() {
  const containerRef = useScrollReveal();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("Meridian Motors");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Querying AI responses...");

  const handleAnalyzeBrand = useCallback((brandName: string) => {
    const brand = brandName.trim() || "Meridian Motors";
    setSelectedBrand(brand);
    setIsDrawerOpen(true);
    setIsLoading(true);
    setLoadingStep("Querying AI responses...");

    // Short, restrained loading progression (~1.2s total)
    setTimeout(() => {
      setLoadingStep("Comparing country-level results...");
    }, 450);

    setTimeout(() => {
      setLoadingStep("Analyzing sources and sentiment...");
    }, 850);

    setTimeout(() => {
      setIsLoading(false);
    }, 1250);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Hero onAnalyze={handleAnalyzeBrand} />
      <ProblemMockup />
      <StatsStrip />
      <LogoStrip />
      <HowItWorks />
      <ProductDeepDive />
      <WhoItsFor />
      <Positioning />
      <FinalCTA onAnalyze={handleAnalyzeBrand} />
      <Footer />

      {/* Slide-in Results Panel */}
      <ResultsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        brand={selectedBrand}
        isLoading={isLoading}
        loadingStep={loadingStep}
      />
    </div>
  );
}

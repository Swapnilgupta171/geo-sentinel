"use client";

import { useState, useCallback, useRef } from "react";
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
import type { QueryResult } from "@/shared/types";

export default function Home() {
  const containerRef = useScrollReveal();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("Meridian Motors");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Querying AI responses...");
  const [apiResults, setApiResults] = useState<QueryResult | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleAnalyzeBrand = useCallback((brandName: string) => {
    const brand = brandName.trim() || "Meridian Motors";
    setSelectedBrand(brand);
    setIsDrawerOpen(true);
    setIsLoading(true);
    setApiResults(null);
    setLoadingStep("Querying AI responses...");
    stopPolling();

    // Try real backend call
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: brand }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Backend API unavailable or error");
        }
        const data = await res.json();
        if (!data.queryId) {
          throw new Error("No queryId returned");
        }

        // Poll for backend results
        pollRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/results/${data.queryId}`);
            if (pollRes.ok) {
              const pollData = (await pollRes.json()) as QueryResult;
              if (pollData.status === "ready") {
                stopPolling();
                setApiResults(pollData);
                setIsLoading(false);
              }
            }
          } catch {
            // keep polling until ready or timeout
          }
        }, 2500);
      })
      .catch(() => {
        // Fallback to local mock experience if backend API is not configured locally
        setTimeout(() => {
          setLoadingStep("Comparing country-level results...");
        }, 450);

        setTimeout(() => {
          setLoadingStep("Analyzing sources and sentiment...");
        }, 850);

        setTimeout(() => {
          setIsLoading(false);
        }, 1250);
      });
  }, [stopPolling]);

  const handleCloseDrawer = useCallback(() => {
    stopPolling();
    setIsDrawerOpen(false);
  }, [stopPolling]);

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
        apiResults={apiResults}
      />
    </div>
  );
}

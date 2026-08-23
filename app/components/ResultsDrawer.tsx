"use client";

import { useEffect, useState } from "react";

export interface BrandAnalysisData {
  brand: string;
  queryTime: string;
  us: {
    country: string;
    code: string;
    model: string;
    sentiment: number;
    visibility: boolean;
    narrative: string;
    sources: string[];
  };
  de: {
    country: string;
    code: string;
    model: string;
    sentiment: number;
    visibility: boolean;
    narrative: string;
    sources: string[];
  };
}

interface ResultsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brand: string;
  isLoading: boolean;
  loadingStep: string;
}

export function ResultsDrawer({
  isOpen,
  onClose,
  brand,
  isLoading,
  loadingStep,
}: ResultsDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open on small screens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Generate realistic contextual data based on brand
  const displayBrand = brand.trim() || "Meridian Motors";
  
  const isDefaultMeridian = displayBrand.toLowerCase().includes("meridian");
  
  const usSentiment = isDefaultMeridian ? "+0.72" : "+0.68";
  const deSentiment = isDefaultMeridian ? "+0.18" : "+0.24";

  const usNarrative = isDefaultMeridian
    ? `${displayBrand} is recognized as a leader in sustainable automotive innovation, with strong consumer trust scores and expanding market share in the mid-range EV segment. Coverage emphasizes competitive pricing and charging infrastructure partnerships.`
    : `${displayBrand} is described in US media and analyst reports as an agile market innovator with strong growth velocity. US queries emphasize product feature momentum, recent funding/expansion milestones, and high consumer satisfaction.`;

  const deNarrative = isDefaultMeridian
    ? `${displayBrand} wird als aufstrebender Wettbewerber im europäischen E-Fahrzeugmarkt beschrieben, der jedoch hinter etablierten deutschen Herstellern zurückbleibt. Bedenken hinsichtlich der Verarbeitungsqualität und des Kundendienstnetzes werden häufig angeführt. Die Berichterstattung betont regulatorische Herausforderungen beim EU-Markteintritt.`
    : `${displayBrand} wird in europäischen Quellen deutlich vorsichtiger bewertet. Deutsche Antworten fokussieren auf offene Zertifizierungsfragen, strenge DSGVO-Konformität und den Wettbewerb mit etablierten EU-Marktführern. Die Marktpräsenz wird als noch im Aufbau befindlich eingestuft.`;

  const cleanDomain = displayBrand.toLowerCase().replace(/[^a-z0-9]/g, "");

  const usSources = isDefaultMeridian
    ? [
        "reuters.com/business/autos/meridian-ev-sales…",
        "caranddriver.com/reviews/meridian-lx…",
        "bloomberg.com/quote/MRDM:US",
        "consumerreports.org/cars/meridian…",
        "techcrunch.com/meridian-charging-deal…",
      ]
    : [
        `reuters.com/business/tech/${cleanDomain}-us-market-growth…`,
        `bloomberg.com/news/articles/${cleanDomain}-expansion…`,
        `techcrunch.com/2025/${cleanDomain}-product-analysis…`,
        `forbes.com/sites/innovation/${cleanDomain}-report…`,
        `wsj.com/articles/${cleanDomain}-quarterly-review…`,
      ];

  const deSources = isDefaultMeridian
    ? [
        "handelsblatt.com/unternehmen/meridian…",
        "spiegel.de/wirtschaft/meridian-eu-markt…",
        "adac.de/rund-ums-fahrzeug/tests/meridian…",
        "manager-magazin.de/autoindustrie…",
        "de.wikipedia.org/wiki/Meridian_Motors",
      ]
    : [
        `handelsblatt.com/unternehmen/${cleanDomain}-eu-regulierung…`,
        `spiegel.de/wirtschaft/unternehmen/${cleanDomain}-vergleich…`,
        `faz.net/finanzen/marktbericht-${cleanDomain}…`,
        `manager-magazin.de/technologie/${cleanDomain}-markt…`,
        `golem.de/news/${cleanDomain}-datenschutz-analyse…`,
      ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[600px] lg:w-[50vw] max-w-[840px] bg-[#0C1017] text-[#E8E8E8] shadow-2xl border-l border-[#2A3040] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`AI Reputation Analysis for ${displayBrand}`}
      >
        {/* Panel Header */}
        <div className="px-6 py-5 border-b border-[#2A3040] bg-[#151A23] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-[#E8E8E8]">
              Kairo
            </span>
            <div className="h-4 w-px bg-[#2A3040]" />
            <span className="font-mono text-xs text-[#8B95A5] uppercase tracking-wider">
              Live AI Reputation Analysis
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded text-[#8B95A5] hover:text-[#FFFFFF] hover:bg-[#2A3040] transition-colors cursor-pointer"
            aria-label="Close analysis panel"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel Content Area */}
        <div className="flex-1 overflow-y-auto mock-scroll p-6 sm:p-8 space-y-6">
          {isLoading ? (
            /* Loading State */
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#2A3040] border-t-[#4ADE80] animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs text-[#8B95A5] uppercase tracking-widest">
                  Querying geo-targeted proxies
                </p>
                <p className="text-sm font-medium text-[#E8E8E8]">
                  {loadingStep || "Comparing country-level AI responses..."}
                </p>
                <p className="font-mono text-xs text-[#8B95A5] pt-1">
                  Entity: <span className="text-[#E8E8E8]">{displayBrand}</span>
                </p>
              </div>
            </div>
          ) : (
            /* Results Loaded */
            <div className="space-y-6 animate-fade-in">
              {/* Brand Summary Bar */}
              <div className="p-4 rounded-lg bg-[#151A23] border border-[#2A3040] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#8B95A5] uppercase tracking-wider block font-mono">
                    Brand Analyzed
                  </span>
                  <span className="text-lg font-bold text-[#E8E8E8] font-display">
                    {displayBrand}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#0C1017] border border-[#2A3040] text-[#8B95A5]">
                    Models: Perplexity + GPT-4o
                  </span>
                  <span className="font-mono text-xs px-2 py-1 rounded bg-[#1B4332]/40 text-[#4ADE80] border border-[#1B4332]">
                    ● Live Comparison
                  </span>
                </div>
              </div>

              {/* Core Insight Callout */}
              <div className="p-3.5 rounded bg-[#151A23]/60 border-l-2 border-[#FBBF24] text-xs text-[#8B95A5] font-mono leading-relaxed">
                <span className="text-[#FBBF24] font-semibold">Core Insight:</span> Same brand query asked in real time. US responses yield an optimistic innovation narrative, while DE responses center on EU regulatory and competitive scrutiny.
              </div>

              {/* Side-by-side Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* United States */}
                <div className="p-5 rounded-lg bg-[#151A23] border border-[#2A3040] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2A3040]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0C1017] border border-[#2A3040] text-[#E8E8E8]">
                        US
                      </span>
                      <span className="text-sm font-semibold text-[#E8E8E8]">
                        United States
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#8B95A5]">
                      US Proxy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#2A3040]">
                    <div>
                      <span className="text-[11px] block text-[#8B95A5] uppercase font-mono">
                        Sentiment
                      </span>
                      <span className="font-mono text-xl font-bold text-[#4ADE80]">
                        {usSentiment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] block text-[#8B95A5] uppercase font-mono">
                        Visibility
                      </span>
                      <span className="font-mono text-xs text-[#E8E8E8] mt-1 block">
                        Prominently Cited
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] block mb-1.5 uppercase font-mono text-[#8B95A5]">
                      AI Response Summary
                    </span>
                    <p className="text-xs leading-relaxed text-[#E8E8E8]">
                      {usNarrative}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#2A3040]/80">
                    <span className="text-[11px] block mb-1.5 uppercase font-mono text-[#8B95A5]">
                      Top Cited Sources ({usSources.length})
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-[#8B95A5]">
                      {usSources.map((url, i) => (
                        <p key={i} className="hover:text-[#E8E8E8] transition-colors truncate">
                          {url}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Germany */}
                <div className="p-5 rounded-lg bg-[#151A23] border border-[#2A3040] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2A3040]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0C1017] border border-[#2A3040] text-[#E8E8E8]">
                        DE
                      </span>
                      <span className="text-sm font-semibold text-[#E8E8E8]">
                        Germany
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#8B95A5]">
                      DE Proxy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#2A3040]">
                    <div>
                      <span className="text-[11px] block text-[#8B95A5] uppercase font-mono">
                        Sentiment
                      </span>
                      <span className="font-mono text-xl font-bold text-[#FBBF24]">
                        {deSentiment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] block text-[#8B95A5] uppercase font-mono">
                        Visibility
                      </span>
                      <span className="font-mono text-xs text-[#E8E8E8] mt-1 block">
                        Secondary Mention
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] block mb-1.5 uppercase font-mono text-[#8B95A5]">
                      AI Response Summary
                    </span>
                    <p className="text-xs leading-relaxed text-[#E8E8E8]">
                      {deNarrative}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#2A3040]/80">
                    <span className="text-[11px] block mb-1.5 uppercase font-mono text-[#8B95A5]">
                      Top Cited Sources ({deSources.length})
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-[#8B95A5]">
                      {deSources.map((url, i) => (
                        <p key={i} className="hover:text-[#E8E8E8] transition-colors truncate">
                          {url}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#8B95A5] font-mono">
                  Same brand. Same question. Different country. Different AI answer.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="px-6 py-4 border-t border-[#2A3040] bg-[#151A23] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8B95A5] font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-[#0C1017] border border-[#2A3040] rounded text-white text-[10px]">Esc</kbd> to close
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-[#2A3040] hover:bg-[#374151] text-xs font-medium text-white rounded transition-colors cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </>
  );
}

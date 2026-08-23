"use client";

import { useState } from "react";

interface HeroProps {
  onAnalyze: (brand: string) => void;
}

export function Hero({ onAnalyze }: HeroProps) {
  const [brandInput, setBrandInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBrand = brandInput.trim() || "Meridian Motors";
    onAnalyze(targetBrand);
  };

  return (
    <section className="pt-8 pb-16 md:pb-24">
      {/* Minimal nav */}
      <nav className="max-w-[1200px] mx-auto px-6 mb-16 md:mb-20 flex items-center justify-between">
        <span className="font-display text-2xl font-bold tracking-tight text-ink">
          Kairo
        </span>
        <button
          onClick={() => onAnalyze("Meridian Motors")}
          type="button"
          className="btn-primary text-sm py-2.5 px-5"
        >
          Get early access
        </button>
      </nav>

      {/* Hero content */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-ink mb-8 leading-[1.08] tracking-tight">
            Your AI reputation isn&rsquo;t the same everywhere.
          </h1>
          <p className="text-lg md:text-xl text-ink-secondary max-w-2xl leading-relaxed mb-10">
            Ask ChatGPT about your brand from the US. Then ask the same question
            from Germany. You&rsquo;ll get a different answer, different sentiment,
            different sources. Kairo shows you both — side by side, with evidence.
          </p>

          {/* Premium Brand Search / Input Experience */}
          <div className="max-w-xl">
            <form
              onSubmit={handleSubmit}
              className="p-2 sm:p-2.5 bg-[#FFFFFF] border border-[#CDCCC7] rounded-lg shadow-sm focus-within:border-[#1B4332] focus-within:ring-1 focus-within:ring-[#1B4332] transition-all flex flex-col sm:flex-row gap-2.5"
            >
              <div className="flex-1 px-3 py-1 flex flex-col justify-center">
                <label
                  htmlFor="hero-brand-input"
                  className="text-[10px] uppercase tracking-wider font-mono text-ink-tertiary font-semibold block mb-0.5"
                >
                  Enter a brand to analyze
                </label>
                <input
                  id="hero-brand-input"
                  type="text"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  placeholder="e.g. Meridian Motors"
                  className="w-full bg-transparent text-ink placeholder:text-ink-tertiary text-base font-medium outline-none border-none p-0"
                />
              </div>

              <button
                type="submit"
                className="btn-primary text-sm sm:text-base py-3 sm:py-3.5 px-6 sm:px-7 whitespace-nowrap justify-center"
              >
                Analyze brand →
              </button>
            </form>

            <div className="flex items-center gap-2 mt-3 text-xs text-ink-tertiary font-mono">
              <span>Try example:</span>
              <button
                type="button"
                onClick={() => {
                  setBrandInput("Meridian Motors");
                  onAnalyze("Meridian Motors");
                }}
                className="underline hover:text-ink transition-colors cursor-pointer"
              >
                Meridian Motors
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setBrandInput("Atlas Health Group");
                  onAnalyze("Atlas Health Group");
                }}
                className="underline hover:text-ink transition-colors cursor-pointer"
              >
                Atlas Health
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

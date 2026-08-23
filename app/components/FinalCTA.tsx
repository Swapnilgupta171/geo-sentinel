"use client";

interface FinalCTAProps {
  onAnalyze: (brand: string) => void;
}

export function FinalCTA({ onAnalyze }: FinalCTAProps) {
  return (
    <section id="cta" className="py-20 md:py-28 bg-[#1B4332]">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <div className="reveal max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            See what AI is saying about your brand — and where the story changes.
          </h2>
          <p className="text-base md:text-lg text-[#E0EFE8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Enter your brand name. Get two countries&rsquo; worth of AI-generated
            perception, side by side, in under two minutes.
          </p>
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById("hero-brand-input") as HTMLInputElement | null;
              if (input && input.value.trim()) {
                onAnalyze(input.value.trim());
              } else {
                onAnalyze("Meridian Motors");
              }
            }}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#1B4332] font-semibold rounded-md hover:bg-[#F2F1ED] transition-all duration-200 cursor-pointer text-base shadow-lg"
          >
            Try it with your brand
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export function ProblemMockup() {
  return (
    <section className="py-16 md:py-24 bg-[#F2F1ED] border-y border-[#E4E3DE]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <p className="font-mono text-xs tracking-widest text-ink-tertiary uppercase mb-3">
            The blind spot
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink max-w-3xl mx-auto tracking-tight">
            Same brand. Same question. Two&nbsp;very&nbsp;different&nbsp;answers.
          </h2>
        </div>

        {/* Product mockup — dark UI panel */}
        <div className="reveal rounded-xl overflow-hidden border border-[#2A3040] shadow-2xl bg-[#0C1017]">

          {/* Mockup header bar */}
          <div className="px-6 py-4 border-b border-[#2A3040] flex items-center justify-between bg-[#151A23]">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-semibold text-[#E8E8E8]">Kairo</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono text-[#8B95A5] bg-[#0C1017] border border-[#2A3040]">
                Live Mirror Analysis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#8B95A5]">
                Entity:
              </span>
              <span className="font-mono text-xs font-medium text-[#E8E8E8] bg-[#0C1017] px-2.5 py-1 rounded border border-[#2A3040]">
                Meridian Motors
              </span>
            </div>
          </div>

          {/* Two-column comparison */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2A3040]">

            {/* US Column */}
            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold tracking-widest px-2.5 py-1 rounded text-[#E8E8E8] bg-[#151A23] border border-[#2A3040]">
                    US
                  </span>
                  <span className="text-sm font-medium text-[#E8E8E8]">
                    United States
                  </span>
                </div>
                <span className="font-mono text-xs text-[#8B95A5]">Perplexity AI (US Proxy)</span>
              </div>

              {/* Sentiment */}
              <div className="flex items-center gap-6 pb-4 border-b border-[#2A3040]">
                <div>
                  <span className="text-xs block mb-1 text-[#8B95A5] uppercase tracking-wider">Sentiment</span>
                  <span className="font-mono text-2xl font-semibold text-[#4ADE80]">+0.72</span>
                </div>
                <div>
                  <span className="text-xs block mb-1 text-[#8B95A5] uppercase tracking-wider">Visibility</span>
                  <span className="font-mono text-sm text-[#E8E8E8]">Mentioned</span>
                </div>
              </div>

              {/* Narrative */}
              <div>
                <span className="text-xs block mb-2 tracking-wider uppercase text-[#8B95A5]">Narrative</span>
                <p className="text-sm leading-relaxed text-[#E8E8E8]">
                  Meridian Motors is recognized as a leader in sustainable automotive innovation,
                  with strong consumer trust scores and expanding market share in the mid-range
                  EV segment. Coverage emphasizes competitive pricing and charging infrastructure
                  partnerships.
                </p>
              </div>

              {/* Citations */}
              <div className="pt-2">
                <span className="text-xs block mb-2 tracking-wider uppercase text-[#8B95A5]">Sources (5)</span>
                <div className="space-y-1.5 font-mono text-xs text-[#8B95A5]">
                  {[
                    "reuters.com/business/autos/meridian-ev-sales…",
                    "caranddriver.com/reviews/meridian-lx…",
                    "bloomberg.com/quote/MRDM:US",
                    "consumerreports.org/cars/meridian…",
                    "techcrunch.com/meridian-charging-deal…",
                  ].map((url) => (
                    <p key={url} className="hover:text-[#E8E8E8] transition-colors truncate">
                      {url}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* DE Column */}
            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold tracking-widest px-2.5 py-1 rounded text-[#E8E8E8] bg-[#151A23] border border-[#2A3040]">
                    DE
                  </span>
                  <span className="text-sm font-medium text-[#E8E8E8]">
                    Germany
                  </span>
                </div>
                <span className="font-mono text-xs text-[#8B95A5]">Perplexity AI (DE Proxy)</span>
              </div>

              {/* Sentiment */}
              <div className="flex items-center gap-6 pb-4 border-b border-[#2A3040]">
                <div>
                  <span className="text-xs block mb-1 text-[#8B95A5] uppercase tracking-wider">Sentiment</span>
                  <span className="font-mono text-2xl font-semibold text-[#FBBF24]">+0.18</span>
                </div>
                <div>
                  <span className="text-xs block mb-1 text-[#8B95A5] uppercase tracking-wider">Visibility</span>
                  <span className="font-mono text-sm text-[#E8E8E8]">Mentioned</span>
                </div>
              </div>

              {/* Narrative */}
              <div>
                <span className="text-xs block mb-2 tracking-wider uppercase text-[#8B95A5]">Narrative</span>
                <p className="text-sm leading-relaxed text-[#E8E8E8]">
                  Meridian Motors wird als aufstrebender Wettbewerber im europäischen
                  E-Fahrzeugmarkt beschrieben, der jedoch hinter etablierten deutschen Herstellern
                  zurückbleibt. Bedenken hinsichtlich der Verarbeitungsqualität und des
                  Kundendienstnetzes werden häufig angeführt. Die Berichterstattung betont
                  regulatorische Herausforderungen beim EU-Markteintritt.
                </p>
              </div>

              {/* Citations */}
              <div className="pt-2">
                <span className="text-xs block mb-2 tracking-wider uppercase text-[#8B95A5]">Sources (5)</span>
                <div className="space-y-1.5 font-mono text-xs text-[#8B95A5]">
                  {[
                    "handelsblatt.com/unternehmen/meridian…",
                    "spiegel.de/wirtschaft/meridian-eu-markt…",
                    "adac.de/rund-ums-fahrzeug/tests/meridian…",
                    "manager-magazin.de/autoindustrie…",
                    "de.wikipedia.org/wiki/Meridian_Motors",
                  ].map((url) => (
                    <p key={url} className="hover:text-[#E8E8E8] transition-colors truncate">
                      {url}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-ink-tertiary mt-6 max-w-lg mx-auto reveal">
          Fictional brand shown for illustration. Real results use live AI queries through
          geo-targeted proxies in each country.
        </p>
      </div>
    </section>
  );
}

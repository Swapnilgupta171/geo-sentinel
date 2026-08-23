export function ProductDeepDive() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="font-mono text-xs tracking-widest text-ink-tertiary uppercase mb-3">
            What you actually see
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink max-w-3xl mx-auto tracking-tight">
            Not a dashboard. A&nbsp;mirror.
          </h2>
          <p className="text-base text-ink-secondary mt-4 max-w-2xl mx-auto leading-relaxed">
            Each column shows exactly what an AI chatbot told a user in that country —
            the narrative it generated, how positive or negative it was, and what sources
            it cited. Nothing more.
          </p>
        </div>

        {/* Detailed mockup */}
        <div className="reveal rounded-xl overflow-hidden border border-[#2A3040] shadow-xl bg-[#0C1017]">

          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2A3040] flex items-center gap-4 bg-[#151A23]">
            <span className="font-display text-sm font-semibold text-[#E8E8E8]">
              Kairo
            </span>
            <div className="h-4 w-px bg-[#2A3040]" />
            <span className="font-mono text-xs text-[#8B95A5]">
              Results for &ldquo;Atlas Health Group&rdquo;
            </span>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2A3040]">
            {/* US Column */}
            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold tracking-widest px-2.5 py-1 rounded text-[#E8E8E8] bg-[#151A23] border border-[#2A3040]">
                    US
                  </span>
                  <span className="text-sm font-medium text-[#E8E8E8]">United States</span>
                </div>
                <span className="font-mono text-base font-semibold text-[#4ADE80]">+0.61</span>
              </div>

              <div className="pt-3 border-t border-[#2A3040]">
                <p className="text-xs tracking-wider uppercase mb-2 text-[#8B95A5]">Summary</p>
                <p className="text-sm leading-relaxed text-[#E8E8E8]">
                  Atlas Health Group is described as an innovative telehealth platform with strong
                  patient satisfaction ratings. Coverage highlights rapid growth in rural access programs
                  and recent FDA clearances for remote diagnostics tools.
                </p>
              </div>

              <div className="pt-3 border-t border-[#2A3040]">
                <p className="text-xs tracking-wider uppercase mb-2 text-[#8B95A5]">Sources (4)</p>
                <div className="space-y-1 font-mono text-xs text-[#8B95A5]">
                  <p>healthcaredive.com/atlas-telehealth…</p>
                  <p>fiercehealthcare.com/digital/atlas…</p>
                  <p>fda.gov/clearances/atlas-remote…</p>
                  <p>en.wikipedia.org/wiki/Atlas_Health…</p>
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
                  <span className="text-sm font-medium text-[#E8E8E8]">Germany</span>
                </div>
                <span className="font-mono text-base font-semibold text-[#4ADE80]">+0.58</span>
              </div>

              <div className="pt-3 border-t border-[#2A3040]">
                <p className="text-xs tracking-wider uppercase mb-2 text-[#8B95A5]">Summary</p>
                <p className="text-sm leading-relaxed text-[#E8E8E8]">
                  Atlas Health Group wird als US-amerikanische Telemedizin-Plattform beschrieben, die
                  versucht, im europäischen Markt Fuß zu fassen. Die Bewertung ist ähnlich positiv,
                  allerdings betonen deutsche Quellen stärker Datenschutzbedenken gemäß DSGVO und die
                  fehlende Integration in das Kassensystem.
                </p>
              </div>

              <div className="pt-3 border-t border-[#2A3040]">
                <p className="text-xs tracking-wider uppercase mb-2 text-[#8B95A5]">Sources (4)</p>
                <div className="space-y-1 font-mono text-xs text-[#8B95A5]">
                  <p>handelsblatt.com/atlas-telemedizin…</p>
                  <p>aerzteblatt.de/atlas-health-eu…</p>
                  <p>datenschutz.org/atlas-dsgvo…</p>
                  <p>de.wikipedia.org/wiki/Atlas_Health…</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-ink-tertiary mt-6 max-w-xl mx-auto reveal">
          Sometimes the two columns look nearly identical. That&rsquo;s not a bug — it means
          the AI&rsquo;s narrative about this brand is consistent across those markets.
          That&rsquo;s a finding, not a failure.
        </p>
      </div>
    </section>
  );
}

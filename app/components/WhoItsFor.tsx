export function WhoItsFor() {
  const personas = [
    {
      title: "Marketing & PR teams",
      description:
        "You track brand sentiment in earned media, social, and search. But you have zero visibility into what AI chatbots tell people who ask about you — and those answers now shape first impressions before anyone clicks a link.",
    },
    {
      title: "Companies expanding into new markets",
      description:
        "Before you enter a market, you need to know how AI already describes you there. If Perplexity tells German users your brand has quality issues, that's a narrative you need to know about before your launch campaign — not after.",
    },
    {
      title: "Agencies building a GEO practice",
      description:
        "Your clients are starting to ask about 'Generative Engine Optimization.' Kairo gives you the diagnostic step that turns a vague pitch into a concrete finding — show them the gap, then sell the fix.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F2F1ED] border-y border-[#E4E3DE]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="font-mono text-xs tracking-widest text-ink-tertiary uppercase mb-3">
            Who it&rsquo;s for
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight">
            You already track everything else.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 reveal">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="bg-[#FFFFFF] rounded-lg border border-[#E4E3DE] p-8 shadow-sm"
            >
              <h3 className="text-base font-bold text-ink mb-3">
                {persona.title}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                {persona.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

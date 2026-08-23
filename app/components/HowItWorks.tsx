export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Enter a brand",
      description:
        "Type any company or product name. No setup, no API keys, no tracking pixels to install first.",
    },
    {
      number: "02",
      title: "We ask AI — as a real person in each country",
      description:
        "Kairo queries AI chatbots through geo-targeted proxies — the same way a real user in New York or Munich would ask. No simulated data.",
    },
    {
      number: "03",
      title: "See the answers side by side",
      description:
        "Compare the narrative, sentiment, and cited sources for each country. Spot the gap — or confirm there isn't one.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F2F1ED] border-b border-[#E4E3DE]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="font-mono text-xs tracking-widest text-ink-tertiary uppercase mb-3">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink tracking-tight">
            Three steps. No setup.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 reveal">
          {steps.map((step) => (
            <div key={step.number} className="bg-[#FFFFFF] p-8 rounded-lg border border-[#E4E3DE] shadow-sm">
              <span className="font-mono text-xs text-[#1B4332] font-bold px-2.5 py-1 rounded bg-[#F0F7F4] inline-block mb-4">
                STEP {step.number}
              </span>
              <h3 className="text-lg font-bold text-ink mb-2.5">
                {step.title}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

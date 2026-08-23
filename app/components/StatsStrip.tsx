export function StatsStrip() {
  const stats = [
    {
      number: "25%",
      label: "of brand discovery happens across AI-powered surfaces",
    },
    {
      number: "88%",
      label: "of marketers use AI every day",
    },
    {
      number: "[X]%",
      label: "of identical brand queries return different answers by country",
    },
    {
      number: "0",
      label: "standard tools measure geographic differences in AI brand perception",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="font-mono text-xs tracking-widest text-ink-tertiary uppercase mb-3">
            Why this matters now
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-ink max-w-2xl mx-auto tracking-tight">
            AI replaced the first page of Google. Nobody&rsquo;s watching what it says.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 reveal">
          {stats.map((stat, i) => (
            <div key={i} className="text-left border-l-2 border-[#1B4332] pl-5">
              <div className="stat-number mb-3">{stat.number}</div>
              <p className="text-sm text-ink-secondary leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

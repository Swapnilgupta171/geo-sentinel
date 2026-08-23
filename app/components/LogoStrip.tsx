export function LogoStrip() {
  return (
    <section className="py-12 border-y border-[#E4E3DE] bg-[#FAFAF7]">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-xs text-ink-tertiary text-center mb-6 tracking-wider uppercase font-mono">
          Built for teams who manage brand reputation across markets
        </p>
        <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
          {["Global Brand Lab", "Meridian Strategy", "Vanguard Media", "Aura Consumer Group", "Horizon PR", "Novus Analytics"].map((name, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded border border-[#E4E3DE] bg-[#F2F1ED] font-mono text-xs text-ink-secondary font-medium tracking-tight"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

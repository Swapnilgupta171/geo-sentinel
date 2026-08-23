export function Footer() {
  return (
    <footer className="py-12 border-t border-[#E4E3DE] bg-[#FAFAF7]">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-ink">Kairo</span>
          <span className="text-xs text-ink-tertiary">
            &mdash; AI brand perception, by country.
          </span>
        </div>
        <p className="text-xs text-ink-tertiary">
          &copy; {new Date().getFullYear()} Kairo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

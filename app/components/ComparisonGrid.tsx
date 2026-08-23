import type { CountryResult } from "@/shared/types";
import { CountryColumn } from "./CountryColumn";

interface ComparisonGridProps {
  results: CountryResult[];
}

export function ComparisonGrid({ results }: ComparisonGridProps) {
  // Ensure consistent order: US first, DE second
  const sorted = [...results].sort((a, b) => {
    const order: Record<string, number> = { us: 0, de: 1 };
    return (order[a.country] ?? 99) - (order[b.country] ?? 99);
  });

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        {sorted.map((result) => (
          <CountryColumn key={result.country} result={result} />
        ))}
      </div>
    </div>
  );
}

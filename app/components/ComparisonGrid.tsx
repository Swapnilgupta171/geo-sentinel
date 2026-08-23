import { CountryResult } from "../../shared/types";
import CountryCard from "./CountryCard";

export default function ComparisonGrid({ results }: { results: CountryResult[] }) {
  // Sort to ensure US is always first for consistent layout
  const sortedResults = [...results].sort((a, b) => {
    if (a.country === 'us') return -1;
    if (b.country === 'us') return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto mt-8">
      {sortedResults.map((result) => (
        <CountryCard key={result.country} result={result} />
      ))}
    </div>
  );
}

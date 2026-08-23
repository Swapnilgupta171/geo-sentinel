"use client";

import { useState } from "react";
import LoadingIndicator from "./components/LoadingIndicator";
import ComparisonGrid from "./components/ComparisonGrid";
import { CountryResult } from "../shared/types";

export default function Home() {
  const [entity, setEntity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CountryResult[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // 1. Trigger the analysis batch
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: entity.trim() }),
      });

      if (!analyzeRes.ok) {
        throw new Error("Failed to start analysis");
      }

      const { queryId } = await analyzeRes.json();
      
      if (!queryId) {
        throw new Error("Did not receive query ID");
      }

      // 2. Poll for results
      pollResults(queryId);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const pollResults = (queryId: number) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(\`/api/results/\${queryId}\`);
        
        if (!res.ok) {
          // If network error, we don't necessarily want to stop polling right away,
          // but for MVP we will log it.
          console.error("Poll request failed", res.status);
          return;
        }

        const data = await res.json();

        if (data.status === "ready") {
          clearInterval(pollInterval);
          setResults(data.results);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error polling results:", err);
      }
    }, 3000); // Poll every 3 seconds

    // Safety timeout to prevent polling forever (e.g. stop after 5 minutes)
    setTimeout(() => {
      clearInterval(pollInterval);
      if (loading) {
        setError("Analysis timed out. Please try again later.");
        setLoading(false);
      }
    }, 5 * 60 * 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            GEO-Sentinel
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test if Perplexity AI describes a brand differently depending on what country the query originates from.
          </p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              placeholder="Enter a brand or entity name (e.g. Tesla)"
              className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !entity.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors whitespace-nowrap"
            >
              {loading ? "Running..." : "Run Test"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center max-w-2xl mx-auto mb-8 border border-red-200">
            {error}
          </div>
        )}

        {loading && !error && <LoadingIndicator />}

        {results && !loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Results for "{entity}"</h2>
            <ComparisonGrid results={results} />
          </div>
        )}
      </div>
    </main>
  );
}

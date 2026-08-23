"use client";

import { useState } from "react";
import type { CountryResult } from "@/shared/types";
import { CitationList } from "./CitationList";

const COUNTRY_LABELS: Record<string, string> = {
  us: "United States",
  de: "Germany",
};

interface CountryColumnProps {
  result: CountryResult;
}

export function CountryColumn({ result }: CountryColumnProps) {
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const { country, answerText, citations, visibility, sentiment, narrativeSummary } =
    result;

  const countryLabel = COUNTRY_LABELS[country] ?? country.toUpperCase();
  const countryCode = country.toUpperCase();

  // Sentiment display: format number with sign prefix, pick color class
  const sentimentDisplay =
    sentiment > 0
      ? `+${sentiment.toFixed(2)}`
      : sentiment < 0
        ? sentiment.toFixed(2) // negative sign already included
        : "0.00";

  const sentimentColorClass =
    sentiment > 0.1
      ? "sentiment-positive"
      : sentiment < -0.1
        ? "sentiment-negative"
        : "sentiment-neutral";

  return (
    <div className="border border-border rounded-lg bg-card p-6 flex flex-col gap-5 animate-fade-in">
      {/* Country header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-data text-xs font-medium tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded">
            {countryCode}
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {countryLabel}
          </h2>
        </div>
      </div>

      {/* Sentiment + Visibility row */}
      <div className="flex items-center gap-6 border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Sentiment
          </span>
          <span className={`font-data text-xl font-medium ${sentimentColorClass}`}>
            {sentimentDisplay}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Visibility
          </span>
          <span
            className={`font-data text-sm font-medium ${
              visibility ? "text-foreground" : "text-muted-foreground/50"
            }`}
          >
            {visibility ? "Mentioned" : "Not mentioned"}
          </span>
        </div>
      </div>

      {/* Narrative summary */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Narrative Summary
        </h3>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {narrativeSummary}
        </p>
      </div>

      {/* Full AI response — expandable */}
      <div className="border-t border-border pt-4">
        <button
          id={`toggle-answer-${country}`}
          type="button"
          onClick={() => setShowFullAnswer(!showFullAnswer)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer group"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showFullAnswer ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="group-hover:underline">
            {showFullAnswer ? "Hide" : "Show"} full AI response
          </span>
        </button>

        {showFullAnswer && (
          <div className="mt-3 p-4 bg-sentinel-surface rounded-md border border-border animate-fade-in">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {answerText}
            </p>
          </div>
        )}
      </div>

      {/* Citations */}
      <div className="border-t border-border pt-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Sources ({citations.length})
        </h3>
        <CitationList citations={citations} />
      </div>
    </div>
  );
}

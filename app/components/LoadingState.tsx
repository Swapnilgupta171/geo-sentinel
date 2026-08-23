"use client";

import { useState, useEffect, useRef } from "react";

const STATUS_PHRASES = [
  "Querying Perplexity via US proxy…",
  "Querying Perplexity via DE proxy…",
  "Waiting for AI responses to complete…",
  "Extracting answer text and citations…",
  "Running narrative analysis…",
];

interface LoadingStateProps {
  entity: string;
}

export function LoadingState({ entity }: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const startTime = useRef(Date.now());

  // Elapsed timer — ticks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate status phrases every 8 seconds
  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % STATUS_PHRASES.length);
    }, 8000);
    return () => clearInterval(phraseTimer);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      {/* Pulsing dot */}
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
        <span className="text-sm text-muted-foreground font-medium">
          Analyzing
        </span>
        <span className="font-data text-sm text-foreground font-medium">
          {entity}
        </span>
      </div>

      {/* Elapsed timer */}
      <div className="font-data text-4xl font-medium text-foreground tracking-wider mb-6">
        {timeDisplay}
      </div>

      {/* Rotating status phrase */}
      <p
        key={phraseIndex}
        className="text-sm text-muted-foreground animate-fade-in"
      >
        {STATUS_PHRASES[phraseIndex]}
      </p>

      {/* Reassurance text — appears after 30 seconds */}
      {elapsed >= 30 && (
        <p className="text-xs text-muted-foreground/60 mt-6 animate-fade-in">
          This typically takes 60–90 seconds. The scraper is navigating
          Perplexity through geo-targeted proxies.
        </p>
      )}
    </div>
  );
}

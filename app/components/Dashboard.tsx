"use client";

import { useState, useRef, useCallback } from "react";
import type { QueryResult } from "@/shared/types";
import { EntityInput } from "./EntityInput";
import { LoadingState } from "./LoadingState";
import { ComparisonGrid } from "./ComparisonGrid";

// ── Mock data for frontend development without backend ──────────────────────
// Remove this block once Kartik's API is live.
const USE_MOCK = true; // flip to false when real endpoints exist
const MOCK_DELAY_MS = 6000; // simulate ~6s wait for demo (real is ~90s)

const MOCK_RESULT: QueryResult = {
  queryId: 1,
  entity: "Tesla",
  status: "ready",
  results: [
    {
      country: "us",
      answerText:
        "Tesla, Inc. is an American electric vehicle and clean energy company headquartered in Austin, Texas. Founded in 2003 by Martin Eberhard and Marc Tarpenning, the company was later joined by Elon Musk, who became its largest investor and eventually CEO. Tesla is widely regarded as a pioneer in the mass-market adoption of electric vehicles, beginning with the Roadster in 2008 and later achieving mainstream success with the Model S, Model 3, Model X, and Model Y. The company also manufactures energy storage systems (Powerwall, Megapack) and solar products. As of 2024, Tesla remains the world's most valuable automaker by market capitalization, though it faces increasing competition from both legacy automakers and newer EV startups.",
      citations: [
        "https://www.tesla.com/about",
        "https://en.wikipedia.org/wiki/Tesla,_Inc.",
        "https://www.reuters.com/business/autos-transportation/tesla-2024",
        "https://www.cnbc.com/tesla/",
        "https://www.bloomberg.com/quote/TSLA:US",
      ],
      visibility: true,
      sentiment: 0.65,
      narrativeSummary:
        "Tesla is presented as a pioneering American EV company with strong market position. The narrative emphasizes innovation, market leadership, and Elon Musk's role. Tone is largely positive with acknowledgment of growing competitive pressures.",
    },
    {
      country: "de",
      answerText:
        "Tesla ist ein US-amerikanischer Hersteller von Elektrofahrzeugen und Energiespeicherlösungen mit Hauptsitz in Austin, Texas. Das Unternehmen wurde 2003 gegründet und wird seit 2008 von Elon Musk als CEO geführt. Tesla betreibt seit 2022 eine Gigafactory in Grünheide bei Berlin, die als wichtiger Produktionsstandort für den europäischen Markt dient. Die Fabrik war jedoch wiederholt Gegenstand von Kontroversen — von Umweltbedenken hinsichtlich der Wassernutzung bis hin zu Arbeitsbedingungen und der Ablehnung einer Betriebsratsgründung durch das Management. Deutsche Automobilexperten sehen Tesla als wichtigen Innovationstreiber, weisen aber auf Qualitätsprobleme und den zunehmenden Wettbewerb durch deutsche Hersteller wie BMW, Mercedes-Benz und Volkswagen hin.",
      citations: [
        "https://de.wikipedia.org/wiki/Tesla,_Inc.",
        "https://www.handelsblatt.com/unternehmen/industrie/tesla",
        "https://www.spiegel.de/wirtschaft/unternehmen/tesla-gigafactory",
        "https://www.tagesschau.de/wirtschaft/tesla-gruenheide",
        "https://www.manager-magazin.de/unternehmen/autoindustrie/tesla",
        "https://www.adac.de/rund-ums-fahrzeug/tests/elektroautos/tesla/",
      ],
      visibility: true,
      sentiment: 0.15,
      narrativeSummary:
        "Tesla is framed through the lens of its German factory operations and local impact. The narrative centers on the Grünheide Gigafactory controversies (water usage, labor conditions) and positions Tesla against established German automakers. Tone is more cautious and critical compared to US sources.",
    },
  ],
};
// ── End mock data ────────────────────────────────────────────────────────────

type Phase = "idle" | "loading" | "ready";

export function Dashboard() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [entity, setEntity] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(
    async (entityName: string) => {
      setEntity(entityName);
      setPhase("loading");
      setResult(null);
      setError(null);
      stopPolling();

      // ── Mock mode: return fake data after a delay ────────────────
      if (USE_MOCK) {
        setTimeout(() => {
          setResult({
            ...MOCK_RESULT,
            entity: entityName,
          });
          setPhase("ready");
        }, MOCK_DELAY_MS);
        return;
      }
      // ── End mock mode ────────────────────────────────────────────

      try {
        // 1. Trigger the analysis
        const triggerRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity: entityName }),
        });

        if (!triggerRes.ok) {
          throw new Error(
            `Failed to start analysis (${triggerRes.status})`
          );
        }

        const { queryId } = (await triggerRes.json()) as { queryId: number };

        // 2. Poll for results every 2.5 seconds
        pollRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/results/${queryId}`);
            if (!pollRes.ok) {
              throw new Error(`Poll failed (${pollRes.status})`);
            }

            const data = (await pollRes.json()) as QueryResult;

            if (data.status === "ready") {
              stopPolling();
              setResult(data);
              setPhase("ready");
            }
          } catch (pollErr) {
            stopPolling();
            setError(
              pollErr instanceof Error
                ? pollErr.message
                : "Polling failed unexpectedly"
            );
            setPhase("idle");
          }
        }, 2500);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start analysis"
        );
        setPhase("idle");
      }
    },
    [stopPolling]
  );

  return (
    <div className="space-y-8">
      {/* Entity input — always visible */}
      <EntityInput
        onSubmit={handleSubmit}
        disabled={phase === "loading"}
        initialValue={entity}
      />

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {phase === "loading" && <LoadingState entity={entity} />}

      {/* Results */}
      {phase === "ready" && result && (
        <ComparisonGrid results={result.results} />
      )}
    </div>
  );
}

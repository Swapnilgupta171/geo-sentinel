# MVP.md — GEO-Sentinel

## What are we building?
A dashboard that shows whether an AI search engine (Perplexity AI) describes the
same brand differently depending on what country the query appears to come from.

## Why are we building it?
To prove a single hypothesis before investing more time: **geo-targeted proxying
produces a measurable difference in AI-generated answers.** If this isn't true,
nothing built on top of it matters. The MVP exists to test this, not to be a
polished product.

## Who is it for?
Internal team + demo audience (hackathon judges). Not building for external
paying users at this stage.

## Core user workflow
```
User enters brand name ("Tesla")
        ↓
Clicks "Run"
        ↓
Backend triggers Bright Data scraper for 2 countries (US, DE)
        ↓
Scraper returns Perplexity's answer + citations per country
        ↓
LLM scores each answer (visibility, sentiment, narrative summary)
        ↓
Dashboard shows the two answers side by side
```

## Confirmed MVP scope (locked)
- **1 entity input** — free text field, no validation beyond non-empty.
- **2 countries** — United States (`us`), Germany (`de`). Hardcoded, not user-selectable.
- **1 fixed prompt** — "What is [entity]'s reputation and market standing?"
- **1 target platform** — Perplexity AI only.
- **1 LLM analysis call** — visibility flag, sentiment (-1 to 1), narrative summary string.
- **2-column comparison UI** — no charts, no animations.
- **Citation list per column** — plain list of source URLs, no dedup analysis.

## Explicitly out of scope (do not build)
- India / 3rd country
- Multiple prompts per run
- Google AI Overviews / SERP API fallback
- Historical trend storage or charts
- Automated alerting / webhooks
- User accounts, auth, multi-tenant anything
- Any platform other than Perplexity (ChatGPT, Gemini, Grok — excluded, auth-gated)
- Retry/queue infrastructure beyond a simple poll loop

These can be added *after* the 2-country hypothesis is proven working end to end.

## Definition of "MVP complete"
Typing "Tesla" into the input, clicking Run, and — within roughly a minute —
seeing two columns (US / DE) each showing a real Perplexity answer, a sentiment
score, and a citation list, with the two columns visibly different from each
other. If the two columns come back identical, the MVP has failed to prove its
hypothesis and that's the important finding, not a bug to hide.

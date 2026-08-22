# AGENT_CONTEXT.md — GEO-Sentinel

**Instructions for the coding agent reading this file:**
If you don't already know which team member you're working with, ask: "Who am
I building for — Swapnil, Kartik, or Shreya?" Then jump to that person's
section below and treat it as your task. Everything above the person sections
is shared context — read it regardless of who you're working with.

---

## PROJECT
GEO-Sentinel is a dashboard that shows whether Perplexity AI describes a brand
differently depending on which country a query appears to come from (via
proxy IP). Full detail: [MVP.md](./MVP.md).

## CURRENT MVP
Confirmed, locked scope: 1 entity input, 2 countries (US, DE) hardcoded, 1
fixed prompt, Perplexity AI only. See [MVP.md](./MVP.md) for what's explicitly out
of scope — do not build any of it without checking with the team first.

## ARCHITECTURE
Frontend (Next.js) → Backend (Next.js API routes) → Bright Data Scraper Studio
(trigger/poll REST API) → SQLite → LLM analysis call → back to frontend.
Full detail: [ARCHITECTURE.md](./ARCHITECTURE.md).

## TECH STACK
Next.js + Tailwind, Next.js API routes, SQLite (`better-sqlite3`), Bright Data
Scraper Studio, OpenAI `gpt-4o-mini`. Full detail: [TECH_STACK.md](./TECH_STACK.md).

## CURRENT STATE
Greenfield project. Nothing has been built yet. `/shared/types.ts` should be
agreed on by all three before implementation starts (see [DEVELOPMENT.md](./DEVELOPMENT.md)).

## [LOGIC.md](./LOGIC.md) — READ BEFORE WRITING CODE, NOT JUST WHEN DEBUGGING
This is the soul of the codebase. It records why each piece of logic was
built the way it was, what outcome it should produce, why the obvious
alternative was rejected, and what else it's chained to.

- **Before writing a new function:** check whether something similar already
  exists in LOGIC.md, and match the input/output shape of anything you're
  connecting to.
- **While debugging:** find the broken function's entry and follow its
  CHAINED TO line before changing code — most bugs are chain breaks, not
  isolated mistakes.
- **After making a real decision** (choosing one approach over a plausible
  other one): add an entry in the same format, and update any CHAINED TO
  notes elsewhere that now point to stale information.

This file should grow every time someone makes a decision, not just when
something breaks. A stale LOGIC.md is more dangerous than none — it will
send the next agent to the wrong place with false confidence.

## SHARED REQUIREMENTS (apply to everyone)
- Match `/shared/types.ts` for anything that crosses a component boundary.
- Don't touch another person's folder (see ownership table below).
- Don't add scope beyond what's in [MVP.md](./MVP.md).
- If you hit a blocker that changes another person's contract (e.g. the shape
  of scraper output, or the API response format), flag it in chat — don't
  silently change a shared file.

## OWNERSHIP TABLE
| Folder | Owner |
|---|---|
| `/scraper` | Swapnil |
| `/app/api`, `/db` | Kartik |
| `/app/page.tsx`, `/app/components` | Shreya |
| `/shared/types.ts` | Shared — propose changes, don't unilaterally edit |

## DOCUMENTATION INDEX
| Document | Purpose |
|---|---|
| [AGENT_CONTEXT.md](./AGENT_CONTEXT.md) (this file) | Main entry point — read this first |
| [MVP.md](./MVP.md) | Locked MVP scope, user workflow, out-of-scope list |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System overview, data flow, DB schema, API interfaces |
| [TECH_STACK.md](./TECH_STACK.md) | Technology choices and rationale |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Project structure, setup instructions, coding conventions |
| [LOGIC.md](./LOGIC.md) | Decision log — why each piece of logic exists and what it chains to |

---

# If the person is SWAPNIL — Scraper Engineer (the core engine)

## CURRENT TASK
Build and validate a Bright Data Scraper Studio collector that scrapes
Perplexity AI's answer text and citation links, and confirm it produces
genuinely different output for a US proxy vs a DE proxy on the same prompt.
This is the highest-risk part of the project — if geo-proxying doesn't change
Perplexity's answers, the whole MVP's premise fails, so validate this early,
before polishing anything else.

## ARCHITECTURE CONTEXT
You own the top of the pipeline. Kartik's backend will call your collector via
Bright Data's `POST /dca/trigger` REST API (not by shelling out to the CLI) —
so your collector just needs a stable Collector ID and a working input schema
with an `entity` field and a `country` field.

## FILES TO MODIFY
- `/scraper/interaction.js` — browser automation (navigate, type prompt, wait for answer)
- `/scraper/parser.js` — Cheerio extraction of answer text + citation URLs
- `/scraper/scraper-notes.md` — record the Collector ID, exact selectors used, and what you observe when comparing US vs DE output

## DO NOT CHANGE
- Anything in `/app`, `/db`, or `/shared/types.ts`

## REQUIREMENTS
1. Use the Bright Data Scraper Studio IDE (AI Agent mode to start, then edit in IDE) — target `https://www.perplexity.ai`.
2. Interaction code: navigate to Perplexity, type the fixed prompt (from [MVP.md](./MVP.md)) into the input, submit, wait for the answer to finish rendering (use `wait_for_selector` with a generous timeout — Perplexity's answer streams in).
3. Parser code: extract the answer's text content and all citation/source URLs into a structured record via `collect()`.
4. Interaction code should only get you to the right state; extraction logic belongs in parser code, not interaction code.
5. Confirm your input schema accepts a `country` parameter and that it actually changes the proxy exit location per run (test with `--country us` and `--country de` via CLI).
6. If the DOM breaks mid-build, use the Self-Healing tool with a plain-language description rather than hand-patching selectors.

## ACCEPTANCE CRITERIA
- Running the collector with `--country us` and `--country de` on the same prompt returns two valid JSON records, each with non-empty answer text and at least one citation URL.
- The two outputs are meaningfully different (different citation domains and/or different phrasing) — or, if they're not, this is documented clearly in `scraper-notes.md` as a finding, not hidden.
- Collector ID is recorded in `scraper-notes.md` and shared with Kartik.

## TESTING
```
npx -p @brightdata/cli bdata scraper run <collector_id> --country us --pretty
npx -p @brightdata/cli bdata scraper run <collector_id> --country de --pretty
```
Diff the two outputs manually. Do this before telling Kartik the collector is ready.

---

# If the person is KARTIK — Backend & Orchestration Engineer

## CURRENT TASK
Build the Next.js API routes that trigger Swapnil's collector for both
countries in one batch call, poll until results are ready, persist everything
to SQLite, and run the LLM analysis call that scores each answer.

## ARCHITECTURE CONTEXT
You sit in the middle of the pipeline: you call Swapnil's collector, you own
the database, and you produce the `QueryResult` shape that Shreya's frontend
consumes. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full data flow and schema.

## FILES TO MODIFY
- `/app/api/analyze/route.ts` — triggers the batch scrape
- `/app/api/results/[id]/route.ts` — returns current status + results
- `/db/schema.sql`, `/db/client.ts` — SQLite setup and queries

## DO NOT CHANGE
- `/scraper` (Swapnil's), `/app/page.tsx` and `/app/components` (Shreya's)

## REQUIREMENTS
1. `POST /api/analyze` accepts `{ entity: string }`, builds a 2-item input array (`us`, `de`), calls Bright Data's `POST /dca/trigger` with Swapnil's Collector ID, stores a new row in `queries`, and returns `{ queryId }` immediately (don't block the request on the full scrape).
2. Implement polling against `GET /dca/dataset?id=<snapshot_id>` — either in a background loop or triggered by the frontend's own poll of `/api/results/:id`. Keep this simple: a `setInterval`-style poll every ~5s, no queue library.
3. Once results arrive, insert two rows into `responses` (one per country) with the raw answer text and citations.
4. Send both raw answer texts to OpenAI (`gpt-4o-mini`, temperature 0) in a single call, requesting strict JSON matching: `visibility` (bool), `sentiment` (-1 to 1), `narrativeSummary` (string) per country.
5. Store the analysis fields back into the `responses` rows.
6. `GET /api/results/:id` returns the `QueryResult` shape from `/shared/types.ts` — `status: "pending"` until both rows are fully populated, `"ready"` once they are.

## DO NOT
- Do not shell out to the Bright Data CLI from backend code — use the REST trigger/dataset endpoints.
- Do not build a job queue or worker system — a simple poll loop is enough for 2 inputs.

## ACCEPTANCE CRITERIA
- `POST /api/analyze` with `{"entity":"Tesla"}` returns a `queryId` within ~1 second.
- Polling `GET /api/results/:queryId` eventually (within ~90s) returns `status: "ready"` with two populated `CountryResult` entries.
- SQLite file contains matching rows after a run completes.

## TESTING
```
curl -X POST localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"entity":"Tesla"}'
curl localhost:3000/api/results/1
sqlite3 geo-sentinel.db "select * from responses;"
```

---

# If the person is SHREYA — Frontend Engineer

## CURRENT TASK
Build the Next.js dashboard: an entity input, a run button, a loading state,
and a 2-column side-by-side comparison view once results are ready.

## ARCHITECTURE CONTEXT
You're the last stage of the pipeline — you call Kartik's API and render what
comes back. You don't need to know anything about the scraper or the LLM call
internals, just the `QueryResult` shape in `/shared/types.ts`.

## FILES TO MODIFY
- `/app/page.tsx` — main page: input, button, state management
- `/app/components/*` — comparison grid, citation list, loading indicator

## DO NOT CHANGE
- `/app/api`, `/db` (Kartik's), `/scraper` (Swapnil's)

## REQUIREMENTS
1. Text input for entity name + "Run" button.
2. On submit: `POST /api/analyze`, get back `queryId`, then poll `GET /api/results/:queryId` every ~2-3s until `status === "ready"`.
3. While pending: show a clear loading state (don't leave the screen blank).
4. Once ready: render a 2-column layout — one column per country (US, DE) — each showing: country label, narrative summary, sentiment (simple numeric or +/- indicator is fine, no chart needed), and a plain list of citation URLs.
5. Handle the "both columns look identical" case gracefully — don't assume they'll always differ; just render what comes back.

## ACCEPTANCE CRITERIA
- Typing "Tesla" and clicking Run shows a loading indicator, then both columns populate with real data.
- No console errors on a normal run.
- Layout is readable at normal desktop width — no need for mobile responsiveness in the MVP.

## TESTING
Manual: run the full flow in a browser against Kartik's local backend. Confirm loading → ready transition and that both columns render independently (test with backend temporarily returning mock data if Kartik's route isn't ready yet).

# LOGIC.md — GEO-Sentinel

**This is the soul of the codebase, not a debug log.** It exists so that any
agent — writing new code, extending existing code, or fixing a bug — inherits
the reasoning behind this project instead of just the code. Code tells you
*what* happens. This file tells you *why*, what a correct outcome looks like,
what was deliberately rejected, and what else depends on it. Treat it as
context you load before you act, not a reference you reach for after
something breaks.

## Before writing ANY new function
1. Check if a similar function already exists below — if it does, read its
   **WHY** and **REJECTED ALTERNATIVE** before writing something that
   duplicates or contradicts it. If you're about to build the rejected
   alternative, stop and ask why it was rejected before proceeding.
2. Check the **CHAINED TO** line of anything your new function will connect
   to. Match its expected input/output shape — don't invent a new shape and
   hope it's compatible.
3. If your function isn't a small variation of something below, it's new
   logic — which means it needs its own entry (see below) once written, not
   just a mental note.

## While debugging
1. Identify the symptom (e.g. "frontend shows loading forever").
2. Find which person's section the symptom most likely lives in.
3. Read that function's **CHAINED TO** line — it tells you what to check next,
   upstream or downstream.
4. Don't fix a function in isolation. If you change its OUTCOME, everything
   downstream in its chain needs to be re-checked.

## After writing or changing any function with a real decision behind it
Add or update an entry in this file, in the same format: WHY THIS LOGIC,
EXPECTED OUTCOME, WHY NOT THE ALTERNATIVE, CHAINED TO. A "real decision" means
you chose one approach over a plausible other one — not every one-line
helper needs an entry, but anything where a different agent could reasonably
have built it differently does. If you change a function's outcome or shape,
update every entry downstream in its chain that now points to stale
information — a wrong CHAINED TO note is worse than none, because it sends
the next agent to the wrong place.

## Full request chain (cross-person — check this first for any end-to-end failure)
```
Shreya: submit button
   → Kartik: POST /api/analyze
      → Kartik: build 2-input batch
         → Swapnil: collector receives {entity, country} via /dca/trigger
            → Swapnil: interaction code runs on Bright Data's browser
               → Swapnil: parser code extracts answer + citations
            → Bright Data: snapshot becomes ready
      → Kartik: poll /dca/dataset picks up snapshot
         → Kartik: insert into responses table
         → Kartik: LLM analysis call
            → Kartik: update responses with sentiment/summary
      → Kartik: GET /api/results/:id returns status:"ready"
   → Shreya: poll picks up "ready", renders 2 columns
```
If a symptom doesn't map cleanly to one person's section below, it's usually
a broken link between two of these arrows — check the shape of data crossing
the boundary against `/shared/types.ts` first.

---

# SWAPNIL — Scraper logic

### 1. `navigate()` to Perplexity in interaction code
- **Why this logic:** Perplexity is a JS-rendered SPA with no static HTML answer content — a plain HTTP request (Code worker) won't see the answer, only the empty shell. A Browser worker that actually renders JS is required.
- **Expected outcome:** a live browser session sitting on Perplexity's homepage, ready to accept input.
- **Why not the alternative:** a Code worker (raw HTTP request) was rejected — it's faster and cheaper, but returns pre-render HTML with no answer text, making the whole scrape pointless.
- **Chained to:** feeds directly into function 2 (prompt submission). If this fails, everything downstream fails — check this first if the collector returns empty records for both countries.

### 2. Type + submit prompt
- **Why this logic:** the fixed MVP prompt (from MVP.md) needs to be typed into Perplexity's input field and submitted the same way a real user would, so the resulting answer reflects genuine RAG behavior, not a crafted/API-only response.
- **Expected outcome:** the prompt is submitted, Perplexity begins generating a streamed answer.
- **Why not the alternative:** calling any undocumented Perplexity internal API was rejected — unstable, likely blocked, and defeats the point of testing what a *real browsing user* sees.
- **Chained to:** depends on function 1 succeeding (page must be loaded and the input selector must exist). Feeds into function 3 (wait for completion). If the selector for the input field changes, this breaks silently — check `scraper-notes.md` for the selector in use.

### 3. `wait_for_selector()` for answer completion
- **Why this logic:** Perplexity streams its answer token by token. Grabbing the DOM too early captures a half-written answer. A wait condition on the answer container (with a generous timeout, e.g. 30-60s) is needed before parsing.
- **Expected outcome:** the browser only proceeds once the answer has finished rendering.
- **Why not the alternative:** a fixed `sleep(10s)` was rejected — too fragile, either wastes time on fast answers or truncates slow ones. A selector-based wait adapts to actual completion.
- **Chained to:** feeds into function 4/5 (parsing). If parsing consistently returns truncated or partial text, the timeout here is too short, not the parser.

### 4. Parser: extract answer text
- **Why this logic:** extraction happens in parser code (Cheerio), separate from interaction code, per Bright Data's own convention — interaction code should only get you to the right page state, not do extraction.
- **Expected outcome:** a clean string of Perplexity's full answer text.
- **Why not the alternative:** extracting text directly inside interaction code (e.g. via `page.evaluate()` right after typing) was rejected — it couples navigation logic to extraction logic, making both harder to debug independently and harder to self-heal (Bright Data's self-heal tool targets parser selectors).
- **Chained to:** depends on function 3 completing correctly. Feeds into `collect()` (function 7). If text comes back empty but the browser preview shows an answer, the selector in parser code is wrong — this is the most common thing self-healing needs to fix.

### 5. Parser: extract citation URLs
- **Why this logic:** citations are the key evidence for the "different countries see different sources" hypothesis — without them, GEO-Sentinel has no way to show *why* two answers differ.
- **Expected outcome:** an array of URLs pulled from citation anchor elements.
- **Why not the alternative:** parsing the full raw HTML for all `<a>` tags and filtering client-side was rejected — too noisy, picks up navigation/footer links unrelated to citations. Targeting citation-specific selectors is more precise, even though it's more fragile to DOM changes.
- **Chained to:** depends on function 3. Feeds into `collect()` (function 7) and, downstream, into Kartik's citation storage and Shreya's citation list render. If citations are missing but answer text is present, this selector specifically is broken — not the whole scraper.

### 6. Country/proxy parameter passing
- **Why this logic:** the entire MVP hypothesis depends on the `country` input actually changing which proxy IP the browser session uses. This must be wired through the collector's input schema (or zone config) so `--country us` and `--country de` genuinely produce different network origins.
- **Expected outcome:** two runs with different `country` values produce answers sourced from different regional search indexes (different citation domains, at minimum).
- **Why not the alternative:** manually rotating proxy credentials outside Bright Data was rejected — Bright Data's infrastructure already handles proxy geo-targeting; reimplementing it would duplicate effort and lose the self-healing/unblocking benefits.
- **Chained to:** this is the single highest-risk logic point in the whole project. If US and DE outputs come back identical, check this before anything else — it means the country parameter isn't actually reaching the proxy layer, and the MVP's core question is still unanswered.

### 7. `collect()` — structured output
- **Why this logic:** `collect()` is what appends a structured record to the collector's final dataset — it's the only way Bright Data returns data to the calling backend.
- **Expected outcome:** one JSON record per run containing `answer_text`, `citations`, and `country`.
- **Why not the alternative:** returning raw unstructured text via `console.log` or similar was never viable — Bright Data's trigger/dataset API only surfaces what's passed through `collect()`.
- **Chained to:** depends on functions 4, 5, and 6 all succeeding. Feeds directly into Kartik's function 1 (batch trigger response parsing). If Kartik's backend gets malformed JSON, check this function's field names against what Kartik's parser expects.

---

# KARTIK — Backend & orchestration logic

### 1. `POST /api/analyze` — batch trigger, not sequential loop
- **Why this logic:** triggering both country inputs in a single `POST /dca/trigger` call (one batch of 2) is faster and more reliable than looping and calling the CLI twice — one network round trip instead of two, and no child-process spawning in a web server.
- **Expected outcome:** one snapshot ID representing both pending country runs.
- **Why not the alternative:** the original research doc's approach — spawning `bdata scraper run` as a child process per country in a sequential loop — was rejected for production code. It's fine for Swapnil's manual CLI testing, but fragile and slow inside an API route.
- **Chained to:** depends on Swapnil's Collector ID being valid and the input schema accepting `{entity, country}`. Feeds into function 2 (polling). If the trigger call itself fails (not the poll), the error will show immediately, not after a timeout — check credentials/collector ID first.

### 2. Poll loop against `/dca/dataset`
- **Why this logic:** Bright Data's API is async — trigger returns immediately, but data isn't ready for roughly 3 minutes. Polling the dataset endpoint every ~5s until status is ready is the simplest way to bridge that gap without extra infrastructure.
- **Expected outcome:** eventually returns both country records once Bright Data finishes the scrape.
- **Why not the alternative:** a webhook-based push notification was rejected for MVP — it requires a publicly reachable endpoint (tunneling/ngrok for local dev) and adds setup complexity disproportionate to a 2-input batch. Polling is simpler to reason about and debug.
- **Chained to:** depends on function 1 producing a valid snapshot ID. Feeds into function 3 (DB insert). If polling times out, check whether Swapnil's collector is actually finishing (test directly via CLI) before assuming the poll logic itself is broken.

### 3. Insert into `responses` table (2 rows per query)
- **Why this logic:** storing raw scraper output separately from analysis output (two logical stages in one table, or two tables) means a failure in the LLM analysis step doesn't lose the raw scrape — you can re-run analysis without re-scraping.
- **Expected outcome:** two rows per query, one per country, with `answer_text` and `citations` populated immediately after the poll succeeds (before analysis runs).
- **Why not the alternative:** storing everything in memory and only persisting after full analysis was rejected — if the LLM call fails, the expensive scrape result would be lost and need re-running.
- **Chained to:** depends on function 2 delivering valid data. Feeds into function 4 (LLM analysis) and directly into function 5 (results endpoint) for the raw-text fields. If the frontend shows raw answers but no sentiment, the break is between this function and function 4, not here.

### 4. LLM analysis — one batched call for both countries
- **Why this logic:** sending both countries' raw text to the LLM in a single call (rather than two separate calls) is cheaper, faster, and lets the model directly compare narrative framing between the two if useful — plus it's one point of failure to handle instead of two.
- **Expected outcome:** strict JSON with `visibility`, `sentiment`, `narrativeSummary` per country, at temperature 0 for consistency.
- **Why not the alternative:** two separate LLM calls (one per country) was considered but rejected for MVP — doubles API calls and cost for no MVP-relevant benefit, since cross-country comparison isn't a scored feature yet.
- **Chained to:** depends on function 3's raw text being present and non-empty. Feeds into function 5 (results endpoint) and Shreya's sentiment/summary render. If JSON parsing fails here, check whether Swapnil's answer text contains characters that break JSON encoding (e.g. unescaped quotes) before assuming the LLM call itself is misconfigured.

### 5. `GET /api/results/:id` — status logic (`pending` vs `ready`)
- **Why this logic:** the frontend needs a simple binary signal to know whether to keep polling or render. `ready` is defined as: both country rows exist AND both have non-null `sentiment`/`narrativeSummary` (i.e. analysis has completed, not just the scrape).
- **Expected outcome:** `pending` while any part of the pipeline (scrape or analysis) is incomplete; `ready` only once everything is populated.
- **Why not the alternative:** returning `ready` as soon as raw scrape data exists (before analysis finishes) was rejected — it would cause the frontend to render a column with an answer but no sentiment score, an inconsistent half-state.
- **Chained to:** depends on functions 3 and 4 both completing. Feeds directly into Shreya's function 1 (poll loop). If the frontend polls forever, check here first — a null field in one of the two rows will keep this stuck on `pending` indefinitely.

---

# SHREYA — Frontend logic

### 1. Frontend poll loop (not websocket)
- **Why this logic:** polling `/api/results/:id` every 2-3s is simple to implement and debug, and the total wait time (under ~90s) doesn't justify the complexity of a websocket connection.
- **Expected outcome:** the UI transitions from loading to rendered automatically once the backend reports `ready`.
- **Why not the alternative:** websockets/SSE were rejected — added infrastructure for a one-shot request/response flow with a short, bounded wait time.
- **Chained to:** depends entirely on Kartik's function 5 correctly returning `ready`. If polling never resolves, the bug is very likely in Kartik's status logic, not this loop — confirm by checking the raw API response with curl before touching frontend code.

### 2. Loading state
- **Why this logic:** the scrape + analysis pipeline takes up to ~90 seconds; leaving the screen blank during that time reads as broken, not "processing."
- **Expected outcome:** a visible, simple loading indicator shown from submit until `status: "ready"`.
- **Why not the alternative:** a fake progress bar with estimated steps ("scraping... analyzing...") was considered but rejected for MVP — it would require the backend to expose intermediate state, which function 5 (Kartik) deliberately doesn't do (only binary pending/ready).
- **Chained to:** depends on function 1's poll state. Purely presentational — if this looks wrong, the bug is in this function alone, not upstream.

### 3. 2-column comparison render
- **Why this logic:** a flat side-by-side layout (US column, DE column) is the most direct way to let a viewer visually compare two answers — no chart or scoring visualization needed to prove the hypothesis.
- **Expected outcome:** each column independently renders whatever `CountryResult` it receives — narrative summary, sentiment, citations — without assuming the two will look similar.
- **Why not the alternative:** a single merged view highlighting only the *differences* between countries was rejected for MVP — it requires diffing logic that doesn't exist yet and risks hiding the actual answer text, which is the core evidence.
- **Chained to:** depends on Kartik's function 5 delivering a `QueryResult` matching `/shared/types.ts`. If one column renders and the other doesn't, check whether both `CountryResult` entries exist in the response — this is a data problem, not a rendering problem.

### 4. Citation list render
- **Why this logic:** a plain list of URLs is enough to prove citations differ by country — no dedup, no domain categorization needed for MVP.
- **Expected outcome:** each column shows its own list of citation URLs as plain links.
- **Why not the alternative:** a cross-column "shared vs exclusive sources" table (as described in the original research doc's Section 12) was deliberately deferred — it's a "Later" feature, not required to prove the core hypothesis.
- **Chained to:** depends on Swapnil's function 5 (citation extraction) reaching this point unbroken through Kartik's storage. Empty citation lists with populated answer text point back to Swapnil's function 5, not here.

### 5. Handling identical/near-identical results
- **Why this logic:** the MVP might succeed technically while disproving the hypothesis (both columns look the same). The UI must render this state normally, not hide it or throw an error.
- **Expected outcome:** if both `CountryResult` entries are nearly identical, they still render side by side exactly as received — the flat data render doesn't special-case this.
- **Why not the alternative:** adding a "no significant difference detected" banner was rejected for MVP — it requires a similarity-scoring function that doesn't exist yet (that's a "Later" feature, and possibly the most interesting one if the MVP is extended).
- **Chained to:** not chained to any specific function — this is a reminder that function 3's render logic shouldn't assume divergence. If someone "fixes" the render to detect and flag identical columns, that's scope creep — flag it against MVP.md before building it.

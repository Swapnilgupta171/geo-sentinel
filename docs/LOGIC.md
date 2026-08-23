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

### 8. `evaluate()` for prompt injection instead of `type()`
- **Why this logic:** Perplexity's search input is a `<div contenteditable>` with `id="ask-input"`, not a standard `<input>` or `<textarea>`. Bright Data's `type(selector, text)` is designed for standard form inputs and doesn't reliably trigger React's state management on contenteditable elements. Using `evaluate()` to set `textContent` directly and dispatch an `input` event ensures Perplexity's JS framework recognises the text and enables the Submit button.
- **Expected outcome:** the prompt text appears in the input and the Submit button becomes clickable, exactly as if a user had typed it.
- **Why not the alternative:** `type('#ask-input', prompt)` was the obvious first choice — simpler, one line. Rejected because it silently fails on contenteditable divs: the text may appear visually but React's internal state doesn't update, so the Submit button stays disabled or the submission sends an empty string. This was confirmed by research into Bright Data's own documentation on contenteditable handling.
- **Chained to:** depends on function 1 (page loaded) and function 2 (input selector exists). Feeds into function 2's submit step. If the prompt is submitted but Perplexity responds with a generic/empty answer, check whether the `input` event dispatch is still being picked up — React may switch to a different synthetic event listener.

### 9. Two-stage wait for answer completion
- **Why this logic:** function 3 describes waiting for the answer, but the actual implementation uses a two-stage approach: (a) `wait('.prose', { timeout: 60000 })` to confirm the answer has started rendering, then (b) `wait('textarea[placeholder*="Ask follow-up"], textarea[placeholder*="follow"], .mt-sm button[aria-label="Copy"]', { timeout: 45000 })` to confirm it has *finished* streaming. The follow-up textarea and Copy button only appear after Perplexity completes its response.
- **Expected outcome:** the parser runs only after the full answer is rendered, not mid-stream.
- **Why not the alternative:** a single `wait('.prose')` (as function 3 generically describes) was insufficient — `.prose` appears as soon as the first token renders, which could be a single word. A fixed `sleep(30s)` was rejected per function 3's rationale. The two-stage approach adapts to actual completion by looking for UI elements that Perplexity itself shows only when generation is done.
- **Chained to:** refines function 3. If the parser returns truncated text, the second-stage selector may have changed — check whether the follow-up textarea or Copy button still uses these selectors/placeholders, and update accordingly.

### 10. Broad external-link filtering for citations (parser)
- **Why this logic:** function 5 describes targeting "citation-specific selectors" for extraction. In practice, Perplexity's citation DOM structure is highly dynamic and uses generated class names that change across deployments. Instead of hunting for a fragile citation-specific container, the parser collects *all* `<a href>` tags on the page and filters to external URLs (excluding `perplexity.ai` internal links, auth URLs, `javascript:`, `mailto:`, etc.), then deduplicates via a Set.
- **Expected outcome:** an array of external URLs representing the sources Perplexity cited in its answer.
- **Why not the alternative:** function 5's original approach — "targeting citation-specific selectors" — is more precise but much more fragile. Perplexity uses dynamically generated class names (e.g. `_1a2b3c`) that change on every deploy. A broad filter picks up some noise (e.g. footer links to external sites) but never misses a real citation. For the MVP, a few extra URLs in the list is acceptable; missing citations is not.
- **Chained to:** this is a deliberate divergence from function 5's original design. Feeds into `collect()` (function 7) and downstream into Kartik's citation storage and Shreya's citation list render. If the citation list is *too* noisy (many irrelevant URLs), the next step is to narrow the filter by scoping `$('a[href]')` to the answer thread container rather than the whole page — but start broad for now.

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

### 6. Elapsed-timer loading UX (not skeleton screen or spinner)
- **Why this logic:** the ~90s wait is too long for a spinner (reads as frozen after ~15s) and too unpredictable for a skeleton screen (skeletons imply content is about to appear, misleading at 60s). An elapsed timer (`00:42` format) plus rotating factual status phrases ("Querying Perplexity via US proxy…") gives the user proof that the page is alive without lying about progress.
- **Expected outcome:** the timer counts up from 00:00, status phrases rotate every ~8s, and a reassurance message ("This typically takes 60–90 seconds") appears after 30s.
- **Why not the alternative:** (a) A generic spinner was rejected — it reads as broken after 15s of no change. (b) A skeleton/shimmer screen was rejected — skeletons set an expectation of imminent content delivery that a 90s wait violates. (c) A fake stepped progress bar ("Step 1: Scraping… Step 2: Analyzing…") was rejected per existing entry #2 — the backend only reports binary pending/ready, so mapped progress would be dishonest and would require constant re-calibration.
- **Chained to:** purely presentational, depends on function 1's poll loop. The status phrases describe the pipeline honestly but don't track it — if the real pipeline order changes, update the phrase list, but no logic depends on it.

### 7. Expand/collapse for full AI response (answerText)
- **Why this logic:** the design brief says long-form `answerText` content must never be clipped. But showing multi-paragraph AI responses at full length in every column pushes the comparison below the fold and buries the side-by-side visual that the design brief calls "the visual hero." Collapsed-by-default with a toggle ("Show full AI response") keeps the comparison compact while making the full text available on demand.
- **Expected outcome:** `narrativeSummary` is always visible (short, analyst-friendly). `answerText` is collapsed behind a toggle and expands in place when clicked — no separate modal, no page navigation.
- **Why not the alternative:** (a) Always-visible scroll within a fixed-height card was rejected — the design brief explicitly says "never a fixed-height card that clips content silently." (b) Always-visible full text was rejected — it buries the comparison layout and makes the two columns unequal heights, destroying the side-by-side read. (c) A modal/overlay was rejected — adds interaction cost and loses context of which country you're reading.
- **Chained to:** depends on `CountryResult.answerText` and `CountryResult.narrativeSummary` being two separate fields. If Kartik's backend ever merges them into one field, this component would need to change its display strategy.

### 8. Mock data fallback for independent frontend development
- **Why this logic:** Shreya's frontend and Kartik's backend are being built in parallel. Without a mock data mode, the frontend can't be tested at all until `/api/analyze` and `/api/results/:id` exist. A `USE_MOCK = true` flag in `Dashboard.tsx` returns realistic fake data after a short delay, enabling full UI flow testing (idle → loading → ready) without any backend.
- **Expected outcome:** when `USE_MOCK` is true, submitting any entity name triggers the loading state for ~6s, then renders two pre-written country columns with realistic Tesla data. Flip to `false` when Kartik's routes are live.
- **Why not the alternative:** (a) MSW (Mock Service Worker) or a test server was rejected — adds a dependency and setup complexity that doesn't justify a 2-endpoint MVP. (b) Hardcoding results without a delay was rejected — it would skip testing the loading state entirely, which is one of the most important UX elements (see entry #6).
- **Chained to:** the mock data shape must match `/shared/types.ts` exactly. If types change, the mock must be updated or it will silently produce a broken UI. When the real backend is ready, set `USE_MOCK = false` and delete the mock block.

### 9. Entity input — plain text, no autocomplete
- **Why this logic:** the design brief specifies "a free-text entity input. No validation beyond non-empty." The audience (CMOs, brand leads) knows what brand they want to look up — there's no universe of entities to suggest from, and autocomplete would imply a database of tracked brands that doesn't exist yet.
- **Expected outcome:** a single text input that accepts any non-empty string and disables while a query is in flight.
- **Why not the alternative:** autocomplete/typeahead was rejected — there's no entity list to search against, and building one is explicitly out of MVP scope.
- **Chained to:** feeds into `POST /api/analyze` via Dashboard's `handleSubmit`. If the backend starts rejecting certain entity strings (e.g. too long, special characters), validation should be added here — but for now, pass through whatever the user types.

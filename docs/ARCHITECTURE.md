# ARCHITECTURE.md — GEO-Sentinel

## System overview
```
Frontend (Next.js)
      ↓  POST /api/analyze { entity }
Backend (Next.js API routes)
      ↓  POST /dca/trigger  (batch: 2 inputs, one per country)
Bright Data Scraper Studio (1 collector, targets Perplexity AI)
      ↓  GET /dca/dataset?id=snapshot_id  (poll until ready)
Backend
      ↓  store raw results
SQLite
      ↓  send raw text to LLM
OpenAI gpt-4o-mini (structured JSON output, temperature 0)
      ↓  store analysis
SQLite
      ↓  GET /api/results/:id
Frontend renders 2-column comparison
```

## Components and responsibilities

| Component | Responsibility | Owner |
|---|---|---|
| Frontend | Entity input, run button, poll for results, render comparison | Shreya |
| Backend API | Trigger scraper, poll for completion, persist data, call LLM | Kartik |
| Scraper (Bright Data) | Navigate Perplexity, submit prompt, extract answer + citations, per-country proxy | Swapnil |
| SQLite | Persist raw scraper output and LLM analysis | Kartik |
| LLM analysis call | Convert raw text into visibility/sentiment/summary | Kartik |

## Key technical decision: trigger/poll, not CLI-in-a-loop
Use Bright Data's REST API directly from the backend:
- `POST /dca/trigger` — queue both country inputs in **one batch call**, get a snapshot ID back.
- `GET /dca/dataset?id=<snapshot_id>` — poll every few seconds until the snapshot is ready.

Do **not** shell out to the Bright Data CLI as a child process from the backend.
The CLI is for local development and manual testing only. The batch trigger
call is faster, avoids spawning processes in production code, and matches
Bright Data's own reference client pattern.

## Data flow (numbered)
1. User submits entity name on the frontend.
2. Backend builds a 2-item input array: `[{country: "us", entity}, {country: "de", entity}]`.
3. Backend calls `POST /dca/trigger` with the collector ID and both inputs, gets back a snapshot ID.
4. Backend polls `GET /dca/dataset?id=<snapshot_id>` every ~5s until status is ready.
5. Backend stores the two raw records (answer text + citation URLs + country) in SQLite.
6. Backend sends both raw texts to the LLM in one call, requesting strict JSON output.
7. Backend stores the analysis (visibility, sentiment, narrative summary) in SQLite.
8. Frontend polls `GET /api/results/:id` until data is present, then renders both columns.

## Database schema (SQLite)

```sql
-- queries: one row per user-initiated run
CREATE TABLE queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- responses: one row per country per query (2 rows per query in MVP)
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_id INTEGER NOT NULL REFERENCES queries(id),
  country TEXT NOT NULL,          -- 'us' or 'de'
  answer_text TEXT,
  citations TEXT,                 -- JSON array of URLs, stored as text
  visibility INTEGER,             -- 0/1
  sentiment REAL,                 -- -1.0 to 1.0
  narrative_summary TEXT
);
```

## API interfaces
- `POST /api/analyze` — body `{ entity: string }` → returns `{ queryId: number }`
- `GET /api/results/:queryId` → returns `{ status: "pending" | "ready", results: [...] }`

## Not decided yet (flag if it matters)
Whether the country parameter is passed via the input schema field on
`/dca/trigger`, or via a separate proxy zone config on the collector itself.
This must be confirmed by Swapnil during scraper build — see his task in
AGENT_CONTEXT.md.

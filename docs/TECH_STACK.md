# TECH_STACK.md — GEO-Sentinel

Frontend: Next.js (App Router) + Tailwind CSS
Backend: Next.js API routes (no separate Express server — one app, fewer moving parts for 3 people on a short timeline)
Database: SQLite via `better-sqlite3`
Scraper: Bright Data Scraper Studio — 1 collector, JS interaction code + Cheerio parser code, targeting Perplexity AI
AI/LLM: OpenAI `gpt-4o-mini`, structured JSON output, temperature 0
Authentication: none (out of scope for MVP)
Deployment: local / single dev machine for the demo, no cloud deployment required
Development tools: Bright Data CLI (`@brightdata/cli`) for local scraper testing only; AI coding agents (Claude Code / Cursor) for implementation

## Why these choices
- **Next.js for both frontend and backend** — one repo, one `npm run dev`, no CORS setup, no second deployment target. Three people can work in the same app without coordinating two servers.
- **SQLite** — zero configuration, a single file, nothing to provision or credential-share between 3 people.
- **gpt-4o-mini** — cheap and fast enough for a single structured-JSON call per run; overkill accuracy isn't needed for an MVP proving a hypothesis.
- **Bright Data CLI kept out of the runtime backend** — it's a dev/testing convenience only; production calls go through the REST trigger/dataset endpoints (see ARCHITECTURE.md).

## Environment variables required
```
BRIGHT_DATA_API_TOKEN=
BRIGHT_DATA_COLLECTOR_ID=      # starts with c_, created by Swapnil
OPENAI_API_KEY=
```

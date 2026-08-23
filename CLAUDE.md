# CLAUDE.md — Claude Code Developer Guidelines for Kairo

This document provides concise instructions for **Claude Code** when working in the **Kairo (GeoSentinel)** codebase.

---

## 1. Project Overview & Product Context
- **Product Name:** Kairo (`Kairo — AI Brand Reputation Intelligence`)
- **Repository:** `geo-sentinel`
- **Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, SQLite (`better-sqlite3`), Bright Data Web Scraper Studio, OpenAI API (`gpt-4o-mini`).

---

## 2. Common Agent Commands

```bash
# Primary setup command (installs dependencies, configures .env.local, runs doctor)
npm run setup

# Diagnostic environment health check
npm run doctor

# Type-check TypeScript code without emitting JS
npx tsc --noEmit

# Run Next.js production build verification
npm run build

# Start local development server
npm run dev

# Run ESLint linter
npm run lint
```

---

## 3. Environment Setup Protocol
1. Verify Node.js version (`node -v`, target `>= 20.14.0`).
2. Run `npm run setup` to initialize `.env.local` safely and prompt for missing credentials.
3. Never attempt to guess or hardcode secret API tokens. Prompt the user if `BRIGHT_DATA_API_TOKEN`, `BRIGHT_DATA_COLLECTOR_ID`, or `OPENAI_API_KEY` are missing.

---

## 4. Codebase Patterns & Architectural Constraints

- **Design Aesthetics:** Kairo uses a restrained, editorial aesthetic with paper backgrounds (`#FBFBF9`), dark forest green CTA buttons (`#1B4332`), and serif typography for headlines (`Playfair Display` / `Merriweather`). Do not introduce neon gradients or glowing startup blobs.
- **Database Client (`db/client.ts`):** Always access SQLite through the lazy `getDb()` function to prevent build-time module evaluation errors.
- **Route Handlers:** API routes in `app/api/` must keep `export const dynamic = 'force-dynamic'`.
- **Backend Flow:**
  - `POST /api/analyze`: Triggers Bright Data scraper batch (`country: 'us'` and `'de'`) via `POST https://api.brightdata.com/dca/trigger`.
  - `GET /api/results/[id]`: Polls `GET https://api.brightdata.com/dca/dataset` and synthesizes sentiment via OpenAI `gpt-4o-mini`.

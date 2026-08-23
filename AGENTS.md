# AGENTS.md — Kairo (GeoSentinel) AI Agent Guide

This document provides machine-readable guidelines for AI coding agents (Claude Code, OpenAI Codex, Cursor, Antigravity) to understand, install, configure, verify, run, and update the **Kairo** repository.

---

## 1. Executive Summary

**Product Name:** Kairo — AI Brand Reputation Intelligence  
**Repository Name:** `geo-sentinel`  
**Purpose:** Enterprise B2B SaaS platform that tracks and compares how AI search engines (specifically Perplexity AI) describe a brand across different geographic markets (e.g., United States vs. Germany).

### Core Workflow
1. User enters a brand name (e.g., `Tesla`, `Meridian Motors`) in the Next.js frontend.
2. Next.js API (`POST /api/analyze`) triggers Bright Data Web Scraper Studio (`c_...` collector) with parallel geographic proxy parameters (`country: 'us'` and `country: 'de'`).
3. Raw AI response text and external source URLs (`citations`) are stored in a local SQLite database (`geo-sentinel.db`).
4. Next.js API (`GET /api/results/[id]`) sends raw responses to OpenAI (`gpt-4o-mini`, `json_object` format) to extract visibility, sentiment (-1.0 to +1.0), and 1-sentence narrative summaries.
5. The React slide-in drawer (`ResultsDrawer.tsx`) displays the US vs. Germany side-by-side comparative analysis.

---

## 2. Key Directories & File Roles

```text
geo-sentinel/
├── app/
│   ├── page.tsx              # Main Kairo landing page & drawer orchestrator
│   ├── layout.tsx            # App Router root layout & metadata
│   ├── globals.css           # Global CSS variables, serif fonts & animations
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts      # POST endpoint: triggers Bright Data scraper batch
│   │   └── results/
│   │       └── [id]/
│   │           └── route.ts  # GET endpoint: polls Bright Data & executes LLM analysis
│   └── components/
│       ├── Hero.tsx          # Main headline & search bar input
│       ├── ResultsDrawer.tsx # Slide-in drawer for US vs DE comparison
│       ├── ProblemMockup.tsx # Visual static comparison mockup
│       ├── StatsStrip.tsx    # Key statistics strip (25%, 88%, [X]%, 0)
│       └── ...               # Additional section components
├── db/
│   ├── client.ts             # SQLite client (better-sqlite3) with lazy getDb()
│   └── schema.sql            # Table schemas (`queries` and `responses`)
├── docs/                     # Architectural specs and logic decision logs
├── images/                   # Product screenshots & visual documentation
├── scraper/
│   ├── interaction.js        # Bright Data Puppeteer interaction script
│   ├── parser.js             # Bright Data Cheerio DOM parser script
│   └── scraper-notes.md      # Scraper selector documentation
├── scripts/
│   ├── setup.js              # Primary interactive setup entry point (npm run setup)
│   ├── doctor.js             # Diagnostic environment health inspector (npm run doctor)
│   ├── install.sh            # Automated installer for macOS / Linux
│   └── install.ps1           # Automated installer for Windows PowerShell
└── shared/
    └── types.ts              # TypeScript interfaces (CountryResult, QueryResult)
```

---

## 3. Environment & Configuration Requirements

Kairo requires three environment variables in `.env.local`:

```env
BRIGHT_DATA_API_TOKEN=your_bright_data_api_token
BRIGHT_DATA_COLLECTOR_ID=your_collector_id_starting_with_c_
OPENAI_API_KEY=your_openai_api_key_starting_with_sk_
```

> **Note for AI Agents:** NEVER attempt to invent, fake, or hardcode real API tokens or secrets. If environment variables are missing, notify the user to fill out `.env.local` using `npm run setup` or by copying `.env.example`.

---

## 4. Agent Operations Protocol

### Step 1: Read Contract & Check Environment
Inspect Node version (`node -v`, target `>= 20.14.0`) and directory files.

### Step 2: Interactive Product Setup
```bash
npm run setup
```
Checks Node runtime, installs dependencies, creates `.env.local` safely, and prompts for missing API credentials if required.

### Step 3: Diagnostic Verification
```bash
npm run doctor
```
Checks Node runtime, `.env.local` key presence, and SQLite connection without printing raw secrets.

### Step 4: Code Verification
```bash
npx tsc --noEmit
npm run build
```

### Step 5: Start Local Development Server
```bash
npm run dev
```
Launches application at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 5. Architectural Safeguards for Agents

1. **Lazy Database Instantiation:** `db/client.ts` uses lazy `getDb()` initialization so native C++ bindings for `better-sqlite3` do not execute during Next.js build-time module evaluation. Maintain this pattern for any new database queries.
2. **Dynamic API Routes:** Both `app/api/analyze/route.ts` and `app/api/results/[id]/route.ts` include `export const dynamic = 'force-dynamic'`. Do not remove these flags.
3. **LLM Fallback Key:** `app/api/results/[id]/route.ts` uses `process.env.OPENAI_API_KEY || 'dummy-key-for-build'` during build evaluation to prevent static analysis crashes when API keys are unconfigured.

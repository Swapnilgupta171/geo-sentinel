# DEVELOPMENT.md — GEO-Sentinel

## Project structure
```
/geo-sentinel
  /app
    /api
      /analyze/route.ts       ← Kartik
      /results/[id]/route.ts  ← Kartik
    /page.tsx                 ← Shreya
    /components/              ← Shreya
  /scraper
    interaction.js             ← Swapnil (also lives in Bright Data IDE)
    parser.js                  ← Swapnil (also lives in Bright Data IDE)
    scraper-notes.md            ← Swapnil (Collector ID, test results, quirks)
  /db
    schema.sql                 ← Kartik
    client.ts                  ← Kartik
  /shared
    types.ts                   ← shared by all three, see below
  /docs
    MVP.md
    ARCHITECTURE.md
    TECH_STACK.md
    DEVELOPMENT.md
    AGENT_CONTEXT.md
  .env.local                   ← not committed
```

## The one shared file: /shared/types.ts
Because three people are building in parallel, agree on this file **before**
writing implementation code. It should define the shape of a query result:

```ts
export interface CountryResult {
  country: "us" | "de";
  answerText: string;
  citations: string[];
  visibility: boolean;
  sentiment: number;        // -1.0 to 1.0
  narrativeSummary: string;
}

export interface QueryResult {
  queryId: number;
  entity: string;
  status: "pending" | "ready";
  results: CountryResult[];
}
```
Kartik's backend produces this shape. Shreya's frontend consumes it. Swapnil's
scraper output gets mapped into `CountryResult` by Kartik's backend, so Swapnil
doesn't need to match this shape exactly — just needs to reliably return
`answerText` and `citations` per country.

## How to run — identical on all three devices
This is a Node.js project — there is no `requirements.txt` and no virtualenv
step. `package.json` pins exact dependency versions, and `.nvmrc` pins the
Node.js version itself, so all three of you get the same environment without
manually matching anything.

```
nvm install        # reads .nvmrc, installs the pinned Node version
nvm use             # switches to it
npm install          # reads package.json, installs exact pinned versions
cp .env.example .env.local   # then fill in the 3 real values (never commit .env.local)
npm run dev           # starts Next.js on localhost:3000
```

If someone doesn't have `nvm` installed: https://github.com/nvm-sh/nvm — takes
under 2 minutes. Without it, just make sure `node -v` matches the version in
`.nvmrc` some other way (e.g. installed directly from nodejs.org).

**Do not add or upgrade a dependency without updating `package.json` in a
commit everyone pulls.** If your local `node_modules` has something the
others don't, `npm install` won't magically sync it — `package.json` is the
single source of truth, not your local folder.

## Coding conventions
- TypeScript for all backend/frontend code.
- One API route per concern — don't combine trigger + poll + analysis into one route.
- No abstraction layers "for future flexibility." Write the straight-line version first.
- Scraper interaction and parser code stays in `/scraper` as plain JS, mirrored from the Bright Data IDE (copy-paste both ways is fine for MVP — no build step needed there).

## Testing (MVP-level, not a full test suite)
- Swapnil: test via CLI — `bdata scraper run <id> --country us --pretty` and `--country de` — compare outputs manually.
- Kartik: `curl -X POST localhost:3000/api/analyze -d '{"entity":"Tesla"}'`, then poll `/api/results/:id`, inspect SQLite rows directly with a SQLite browser or `sqlite3` CLI.
- Shreya: manual browser test — submit "Tesla," confirm both columns render, confirm loading state shows while pending.

## Important rules
- Don't modify another person's folder directly. If you need a change to
  `/shared/types.ts`, propose it in chat with the other two before editing —
  it's the one file everyone depends on.
- Don't add new npm dependencies without checking they're actually needed for
  the confirmed MVP scope (see MVP.md — out of scope list).
- `docs/AGENT_CONTEXT.md` is the source of truth for "what do I build right now."
  If something in this file conflicts with it, AGENT_CONTEXT.md wins.

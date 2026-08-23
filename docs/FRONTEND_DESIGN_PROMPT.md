# Frontend Design Brief — AI Brand Perception Mirror (MVP)

Use this as the prompt for whoever (or whatever agent) designs the UI. It covers *why this exists* and *what to build*, in that order, because the visual tone should follow from the positioning — not just the component list.

---

## 1. What this product is

A tool that shows companies how AI chatbots (ChatGPT, Perplexity, etc.) describe their brand **differently depending on what country the question is asked from** — side by side, with evidence.

One-line pitch: **"A mirror that shows a company how AI is talking about them, in different parts of the world, at the same time."**

## 2. Who is looking at this screen

Not consumers. The audience is:
- Marketing/PR/brand leads at multinational companies
- Global expansion teams sizing up a market before entering it
- Agencies pitching "GEO" (Generative Engine Optimization) as a service to clients

These are people who already live inside dashboards — Semrush, Brandwatch, HubSpot, Looker. They are not impressed by playful or "startup cute" design. They're reassured by design that looks like **evidence**, not by design that looks like a demo.

## 3. Market position this design needs to communicate

The AI-brand-monitoring space (GEO/AEO tools) is already crowded — Profound, Otterly.ai, Peec AI, Semrush AI Toolkit, HubSpot AI Search Grader, Sight AI, and a dozen others all track "does my brand get mentioned by ChatGPT." That's table stakes now.

Almost none of them ask the question this product asks: **does the answer change depending on which country you ask from?** That's the entire wedge. The design should make this comparison — not a mention-count or a sentiment score — the visual hero of the page. If a visitor screenshots this page, the thing they should be looking at is two countries' answers next to each other, not a dashboard widget.

Corollary: the two columns coming back looking nearly identical is a **valid, expected result** for this MVP (it's literally what's being tested). The layout must not imply "difference found!" by default — it should feel equally intentional whether the columns diverge sharply or barely at all. Avoid any design language (red/green halves, "gap detected!" banners) that presupposes a difference exists before the data says so.

## 4. Tone / aesthetic direction

- Serious, analyst-grade, quietly confident — closer to a Bloomberg terminal or a legal/compliance tool than a marketing SaaS landing page.
- No mascots, no gradients-as-decoration, no illustration. Typography and layout carry the weight.
- Sentiment is a number/indicator, not a chart — resist the urge to visualize it further. Underdesigning this part is correct; it's a proof of concept, not a data-viz showcase.
- This is a proof of concept for one country pair (US/DE) and one brand at a time — the design shouldn't oversell scale it doesn't have yet (e.g., don't design a multi-country selector or a history/trends view; those are explicitly future work).

## 5. Technical scope (this is the entire MVP — nothing else exists)

**One page. No routing.** Three states on that single page:

1. **Idle** — a free-text entity input + a "Run" button. No validation beyond non-empty.
2. **Loading** — after submit, waiting on the backend. Can take up to ~90 seconds — the loading state needs to hold attention or at least reassure for that long, not just show a generic spinner that reads as "broken" after 15 seconds.
3. **Ready** — a 2-column comparison grid, US vs. DE, rendered side by side.

**Each column contains:**
- Country label
- Narrative summary text
- Sentiment (a number or +/− indicator only — no chart)
- Citation list (plain list of URLs, no dedup/styling logic)

**Content handling constraint:** `answerText`/narrative content can run to full paragraph length (Perplexity-style long-form answers). Design for scroll or expand/collapse within the column — never a fixed-height card that clips content silently.

**Backend contract (only two endpoints, ever):**

```
POST /api/analyze
  send: { entity: string }
  receive: { queryId: number }
  → fires once, on Run click

GET /api/results/:queryId
  → poll every 2–3s after receiving queryId
  → stop polling once status === "ready"
  receive:
  {
    queryId: number,
    entity: string,
    status: "pending" | "ready",
    results: [
      {
        country: "us" | "de",
        answerText: string,
        citations: string[],
        visibility: boolean,
        sentiment: number,       // -1.0 to 1.0
        narrativeSummary: string
      }
      // second country
    ]
  }
```

## 6. Explicit constraints

- Desktop-only. No responsive/mobile layout needed for this MVP.
- No animations beyond what's needed for the loading state.
- No charts.
- No multi-page flow, no history, no saved queries, no auth screens — those don't exist yet.

## 7. What "done" looks like

A single HTML/React screen that:
- Looks credible enough to hand to a CMO without a disclaimer
- Handles a ~90s wait without feeling broken
- Displays two columns that look equally intentional whether they agree or disagree
- Never clips a long AI-generated answer

---

*Source docs: `MVP.md`, `ARCHITECTURE.md`, `AGENT_CONTEXT.md` (Shreya section). This brief is the reduced frontend-only surface of those.*

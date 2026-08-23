# scraper-notes.md — GEO-Sentinel Scraper

## Collector ID
**TODO** — paste the Collector ID here once the scraper is created in Bright Data Scraper Studio. Share this with Kartik so his backend can trigger it via `POST /dca/trigger`.

```
COLLECTOR_ID = <paste here>
```

---

## Scraper Configuration

### Worker type
**Browser** — required because Perplexity is a JS-rendered SPA. A Code worker would only see the empty HTML shell with no answer content.

### Input schema
```json
{
  "entity": "string — the brand/company name to query",
  "country": "string — 2-letter ISO code: 'us' or 'de'"
}
```

### Target URL
`https://www.perplexity.ai`

### Fixed prompt template (from MVP.md)
```
What is [entity]'s reputation and market standing?
```

---

## Selectors in Use

| Purpose | Selector | Notes |
|---|---|---|
| Search input | `#ask-input` | Contenteditable `<div>`, not a `<textarea>`. Standard `type()` doesn't work — must use `evaluate()` to set `textContent` and dispatch an `input` event. |
| Submit button | `button[aria-label="Submit"]` | Appears once text is entered in the input. |
| Answer container | `.prose` | First `.prose` element on the page is the primary answer. Perplexity streams tokens into this container. |
| Answer completion signal | `textarea[placeholder*="Ask follow-up"]` or `button[aria-label="Copy"]` | These elements appear only after the answer finishes generating. Used as the wait condition in interaction.js. |
| Citation links | External `<a href>` elements | Parser filters all `<a>` tags for external URLs (excluding perplexity.ai internal links, auth URLs, etc.). |

> **If any of these selectors break**, use Bright Data's Self-Healing tool with a plain-language description (e.g. "the text input where users type their question") rather than guessing at new selectors.

---

## Country/Proxy Configuration

The `country` parameter is passed via the **input schema** and applied in interaction.js using:
```javascript
country(input.country);
```
This is called **before** `navigate()` so the entire browser session is routed through the correct geo-proxy from the first request.

**This resolves the open question in ARCHITECTURE.md** (line 80-83): the country parameter is passed via the input schema field on `/dca/trigger`, NOT via a separate proxy zone config on the collector itself.

---

## Testing Commands

```bash
# Test US proxy
npx -p @brightdata/cli bdata scraper run <COLLECTOR_ID> --input '{"entity":"Tesla","country":"us"}' --pretty

# Test DE proxy
npx -p @brightdata/cli bdata scraper run <COLLECTOR_ID> --input '{"entity":"Tesla","country":"de"}' --pretty
```

Diff the two outputs manually. Both should return non-empty `answer_text` and at least one citation URL.

---

## Test Observations

### Run 1 — [DATE TODO]
**US output:**
- answer_text: [paste excerpt]
- citations count: [number]
- notable citation domains: [list]

**DE output:**
- answer_text: [paste excerpt]
- citations count: [number]
- notable citation domains: [list]

**Comparison:**
- [ ] Answer text is meaningfully different (different phrasing, emphasis, facts)
- [ ] Citation domains differ between US and DE
- [ ] Both outputs are valid JSON with non-empty fields
- [ ] If outputs are identical, document this as a finding — it means geo-proxying doesn't change Perplexity's answers and the MVP hypothesis may be disproven

---

## Known Quirks / Gotchas

1. **Contenteditable input**: Perplexity's search box is a `<div contenteditable>` with `id="ask-input"`, not a standard form input. Standard `type(selector, text)` won't trigger React state updates. The interaction code uses `evaluate()` to set `textContent` and dispatches an `input` event manually.

2. **Streaming answers**: Perplexity streams its answer token-by-token. Grabbing the DOM too early captures a partial answer. The interaction code waits for a completion signal (follow-up textarea or Copy button appearing) with a 45s timeout.

3. **Login prompts**: Perplexity may show login modals or cookie banners. Bright Data's unblocking infrastructure should handle most of these, but if the collector consistently fails, check if a dismissal step is needed in interaction.js.

4. **Rate limiting**: If running the collector repeatedly in quick succession, Perplexity may throttle or block. Space out test runs.

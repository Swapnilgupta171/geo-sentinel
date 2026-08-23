// ============================================================================
// interaction.js — Bright Data Scraper Studio (Browser worker)
// Owner: Swapnil
//
// PURPOSE:
//   Navigate to Perplexity AI, type the fixed prompt, submit, and wait for the
//   streamed answer to finish rendering. Hand off to parser.js via parse().
//
// INPUT SCHEMA (from /dca/trigger):
//   { entity: string, country: "us" | "de" }
//
// BRIGHT DATA WORKER TYPE: Browser (required — Perplexity is a JS-rendered SPA)
// ============================================================================

// --- Step 1: Set proxy exit country from input ---
// This MUST happen before navigate() so the browser session is routed through
// the correct geo-proxy from the very first request.
country(input.country);

// --- Step 2: Navigate to Perplexity AI ---
navigate('https://www.perplexity.ai', { timeout: 30000 });

// --- Step 3: Wait for the search input to appear ---
// Perplexity's homepage loads a contenteditable div with id="ask-input".
// Wait for it to confirm the page is interactive.
wait('#ask-input', { timeout: 15000 });

// --- Step 4: Build the prompt from the entity ---
// Fixed prompt shape from MVP.md — do not change without team agreement.
const prompt = "What is " + input.entity + "'s reputation and market standing?";

// --- Step 5: Inject prompt into the contenteditable input ---
// Perplexity uses a contenteditable div, NOT a standard <input>/<textarea>.
// Standard type() won't reliably trigger React's state updates on contenteditable
// elements. We use click() to focus, then evaluate() to set the text and dispatch
// an input event so Perplexity's JS recognises the change.
click('#ask-input');

evaluate((promptText) => {
    const el = document.querySelector('#ask-input');
    if (!el) throw new Error('ask-input not found');
    el.focus();
    el.textContent = promptText;
    // Dispatch input event so React picks up the change and enables Submit
    el.dispatchEvent(new Event('input', { bubbles: true }));
}, prompt);

// --- Step 6: Submit the prompt ---
// Short pause to let React state settle after the injected input event,
// then click the Submit button.
wait('button[aria-label="Submit"]', { timeout: 5000 });
click('button[aria-label="Submit"]');

// --- Step 7: Wait for the answer to finish streaming ---
// Perplexity streams its answer token-by-token. The answer text lives inside
// a container with class "prose". We wait for it with a generous timeout
// because complex queries can take 30-60s to finish generating.
//
// Two-stage wait:
//   a) Wait for the .prose container to appear (answer started).
//   b) Wait additional time for streaming to complete. We use a heuristic:
//      wait for a follow-up input to appear (Perplexity shows a new input
//      box after the answer finishes), OR fall back to a fixed delay.
wait('.prose', { timeout: 60000 });

// Wait for the follow-up input area or action buttons that appear after
// the answer finishes streaming. These indicate generation is complete.
// The "Ask follow-up" textarea appears below the answer once done.
// If this selector doesn't match, the 45s timeout is the fallback.
wait('textarea[placeholder*="Ask follow-up"], textarea[placeholder*="follow"], .mt-sm button[aria-label="Copy"]', { timeout: 45000 });

// --- Step 8: Parse and collect ---
// Hand off to parser.js to extract answer text + citations via Cheerio.
const data = parse();

// Attach the country and entity to the parsed record so Kartik's backend
// can map it to the correct row without guessing.
data.country = input.country;
data.entity = input.entity;

collect(data);

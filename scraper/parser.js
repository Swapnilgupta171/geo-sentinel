// ============================================================================
// parser.js — Bright Data Scraper Studio (Parser code)
// Owner: Swapnil
//
// PURPOSE:
//   Extract Perplexity's answer text and citation URLs from the rendered DOM.
//   This runs AFTER interaction.js has navigated to the answer page.
//
// ENVIRONMENT:
//   - Cheerio ($) is pre-loaded — use it like jQuery to select DOM elements.
//   - Return a plain object; interaction.js calls collect() on the result.
//
// OUTPUT SHAPE (consumed by interaction.js → collect() → Kartik's backend):
//   {
//     answer_text: string,   // full answer text
//     citations: string[]    // array of source/citation URLs
//   }
// ============================================================================

// --- Extract answer text ---
// Perplexity renders its answer inside a container with class "prose".
// There may be multiple .prose elements on the page (e.g. if there are
// related questions), but the first one is the primary answer.
// We grab its full text content, trimmed of whitespace.
const answerEl = $('.prose').first();
const answer_text = answerEl.text().trim();

// --- Extract citation URLs ---
// Perplexity shows source citations in two places:
//   1. A "Sources" section above the answer with cards/chips linking to sources.
//   2. Inline numbered superscript references within the answer text.
//
// Strategy: collect all anchor hrefs that point to external domains from within
// the answer thread area, filtering out Perplexity's own internal links
// (navigation, auth, etc.) and deduplicating.
const citationSet = new Set();

// Approach A: Source cards/chips — typically rendered as anchor tags with
// data-testid or within a sources container. Look for links in the area
// preceding the .prose answer that link to external sites.
$('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    // Skip Perplexity internal links
    if (href.startsWith('/') || href.startsWith('#')) return;
    if (href.includes('perplexity.ai')) return;

    // Skip javascript: and mailto: links
    if (href.startsWith('javascript:') || href.startsWith('mailto:')) return;

    // Skip social/auth links
    if (href.includes('google.com/accounts') || href.includes('apple.com')) return;

    // Accept external URLs as citation candidates
    try {
        const url = new URL(href);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            citationSet.add(href);
        }
    } catch (e) {
        // Malformed URL — skip
    }
});

const citations = Array.from(citationSet);

return {
    answer_text: answer_text,
    citations: citations
};

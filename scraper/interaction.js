// Bright Data Scraper Studio - Interaction Code (Browser Worker)
// Target URL: https://www.perplexity.ai/

const entity = input.entity || "Tesla";
const country = input.country || "us";
const promptText = encodeURIComponent(`What is ${entity}'s reputation and market standing?`);

// 1. Navigate directly to Perplexity search results URL
navigate(`https://www.perplexity.ai/search?q=${promptText}`);

// 2. Wait for answer prose container to appear
wait('div.prose, div[dir="auto"], main');

// 3. Wait for citation links to appear in DOM (indicates streaming completed)
wait('a[href^="http"]');

// Bright Data Scraper Studio - Interaction Code
// Target URL: https://www.perplexity.ai/

const entity = input.entity || "Tesla";
const country = input.country || "us";
const promptText = \`What is \${entity}'s reputation and market standing?\`;

// Wait for the main input text area to appear
// Perplexity frequently updates their DOM, but textareas are usually identifiable
await wait_for_selector('textarea[placeholder*="Ask anything"]', { timeout: 15000 });

// Focus and type the prompt
await type('textarea[placeholder*="Ask anything"]', promptText);

// Wait a tiny bit and submit by pressing Enter
await wait(500);
await press_key('Enter');

// Perplexity streams the answer. We need to wait until the answer stops generating.
// A common pattern is waiting for the specific answer container to appear, 
// and then waiting until the "Rewrite" or "Share" buttons appear at the bottom of the answer,
// or simply waiting a generous amount of time since wait_for_selector might not reliably detect "done streaming".
// In Bright Data, we can wait for a selector that only appears when generation finishes, 
// e.g., the clipboard/copy icon or share icon that appears below the answer.
await wait_for_selector('button[aria-label="Copy text"], button[aria-label="Share"]', { timeout: 45000 });

// Add a slight buffer to ensure all DOM elements (like citations) are fully rendered
await wait(2000);

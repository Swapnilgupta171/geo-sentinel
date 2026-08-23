# Scraper Notes

**Collector ID:** `c_1234567890abcdef` *(PLACEHOLDER - Swapnil, update this once you create the collector in Bright Data)*

## Proxy Configuration
- The collector's input schema must accept a `country` string (`"us"` or `"de"`).
- Ensure that the scraper zone is configured to route traffic based on this `country` input, or that the interaction code sets the country context if doing it programmatically in Bright Data.

## Selectors Used
### Interaction
- Input field: `textarea[placeholder*="Ask anything"]`
- Completion signal: `button[aria-label="Copy text"], button[aria-label="Share"]`

### Parser
- Answer Text: `div.prose, div[dir="auto"]`
- Citations: `a[href^="http"]` (filtered to exclude `perplexity.ai` internal links)

*Note: Perplexity frequently changes their CSS classes. If extraction returns empty strings, use the **Self-Healing** tool in the Bright Data IDE with a plain English prompt like "Extract the main answer text and all source URLs".*

## Test Observations (US vs DE)
*(Swapnil, run the tests via CLI and record your observations here)*

- **US Prompt Result:** 
  - (Did it work? Record a brief note about the framing or citations here)
- **DE Prompt Result:** 
  - (Did it work? Did the citations or framing change compared to the US run?)
- **Conclusion:** 
  - (Does the data prove the MVP hypothesis that geo-proxying changes the AI's output?)

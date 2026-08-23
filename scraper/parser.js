// Bright Data Scraper Studio - Parser Code
// Expected to run after interaction.js completes

// Note: Selectors may need to be adjusted based on Perplexity's current DOM.
// Use Bright Data's Self-Healing tool if these break.

// 1. Extract the main answer text.
// Perplexity usually places the main answer inside a div with specific prose classes.
// Here we target the primary container that holds the generated answer.
let answer_text = $('div.prose, div[dir="auto"]').text().trim();

// 2. Extract citation URLs.
// Citations are usually rendered as links with superscript numbers, or in a specific "Sources" block.
// We look for all external links that look like sources.
let citations = [];

// Method A: Look for the source pill links at the top of the answer
$('a[href^="http"]').each((i, el) => {
    let url = $(el).attr('href');
    
    // Filter out internal perplexity links or irrelevant links
    if (url && !url.includes('perplexity.ai') && !url.includes('twitter.com/intent')) {
        // Ensure no duplicates
        if (!citations.includes(url)) {
            citations.push(url);
        }
    }
});

// Final output payload
return collect({
    country: input.country || "us",
    answer_text: answer_text,
    citations: citations
});

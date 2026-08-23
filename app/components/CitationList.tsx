interface CitationListProps {
  citations: string[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 italic">
        No citations returned
      </p>
    );
  }

  return (
    <ol className="space-y-1.5">
      {citations.map((url, index) => {
        // Display a truncated version of the URL for readability
        let displayUrl = url;
        try {
          const parsed = new URL(url);
          displayUrl =
            parsed.hostname +
            (parsed.pathname.length > 40
              ? parsed.pathname.slice(0, 40) + "…"
              : parsed.pathname);
        } catch {
          // If URL parsing fails, just truncate the raw string
          displayUrl =
            url.length > 60 ? url.slice(0, 60) + "…" : url;
        }

        return (
          <li key={`${url}-${index}`} className="flex items-baseline gap-2">
            <span className="font-data text-xs text-muted-foreground/50 select-none shrink-0">
              {index + 1}.
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 break-all"
              title={url}
            >
              {displayUrl}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightText({ text, query, className }: HighlightTextProps) {
  if (!query) return <span className={className}>{text}</span>;

  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: { text: string; highlight: boolean }[] = [];
  let start = 0;

  let idx = lower.indexOf(lowerQuery, start);
  while (idx !== -1) {
    if (idx > start) {
      parts.push({ text: text.slice(start, idx), highlight: false });
    }
    parts.push({
      text: text.slice(idx, idx + query.length),
      highlight: true,
    });
    start = idx + query.length;
    idx = lower.indexOf(lowerQuery, start);
  }
  if (start < text.length) {
    parts.push({ text: text.slice(start), highlight: false });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            // biome-ignore lint/suspicious/noArrayIndexKey: static render, order won't change
            key={i}
            className="rounded-sm not-italic"
            style={{ backgroundColor: "var(--highlight-mark-bg)" }}
          >
            {part.text}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static render, order won't change
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}

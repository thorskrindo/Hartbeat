/** A quiet quote shown to a manager just before they start an engagement survey or initiative. */
export function QuoteCard({ text, source, lead = "Before you begin" }: { text: string; source: string; lead?: string }) {
  return (
    <figure className="quote rise" style={{ margin: 0 }}>
      <span className="label" style={{ color: "#9EC3FF" }}>{lead}</span>
      <blockquote>{text}</blockquote>
      <figcaption>{source}</figcaption>
    </figure>
  );
}

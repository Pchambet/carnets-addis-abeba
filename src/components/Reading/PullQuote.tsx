// PullQuote — a pull quote displayed mid-article, NYT-style.
// Usage in Markdown: lines starting with "> PQ:" are extracted as pull quotes.
export default function PullQuote({ text }: { text: string }) {
    return (
        <blockquote className="pull-quote not-prose" aria-label="Citation mise en avant">
            &ldquo;{text}&rdquo;
        </blockquote>
    );
}

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-center gap-4 border-t bg-background px-4 py-3 text-xs text-muted-foreground">
      <span>© 2026 AI Landscape</span>
      <span aria-hidden="true">·</span>
      <Link href="/about" className="transition-colors hover:text-foreground">
        About
      </Link>
      <span aria-hidden="true">·</span>
      <a
        href="https://github.com/kiliczsh/ailandscape.org"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-foreground"
      >
        Contribute on GitHub
      </a>
    </footer>
  );
}

import { Rss } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t bg-background px-4 py-3 text-xs text-muted-foreground">
      <span>© 2026 AI Landscape</span>
      <span aria-hidden="true">·</span>
      <Link href="/about" className="transition-colors hover:text-foreground">
        About
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/submit" className="transition-colors hover:text-foreground">
        Submit a tool
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
      <span aria-hidden="true">·</span>
      <a
        href="/feed.xml"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
        title="RSS feed of recently added tools"
      >
        <Rss size={11} aria-hidden="true" />
        RSS
      </a>
    </footer>
  );
}

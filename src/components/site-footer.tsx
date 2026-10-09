import { Rss } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { FooterCategoryLinks } from "@/components/footer-category-links";
import { getLandscapeData } from "@/data/landscape";

export function SiteFooter() {
  const data = getLandscapeData();
  return (
    <footer className="border-t bg-background text-xs text-muted-foreground">
      <nav
        aria-label="Categories"
        className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-3 gap-y-1 px-4 pt-3"
      >
        <FooterCategoryLinks names={data.landscape.map((c) => c.name)} />
      </nav>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-3">
        <span>© 2026 AI Landscape</span>
        <span aria-hidden="true">·</span>
        <Link href="/about" className="transition-colors hover:text-foreground">
          About
        </Link>
        <span aria-hidden="true">·</span>
        <Link
          href="/submit"
          className="transition-colors hover:text-foreground"
        >
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
      </div>
    </footer>
  );
}

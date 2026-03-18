export function SiteFooter() {
  return (
    <footer className="flex items-center justify-center gap-4 border-t bg-background px-4 py-3 text-xs text-muted-foreground">
      <span>© 2026 AI Landscape</span>
      <span aria-hidden="true">·</span>
      <a
        href="https://github.com/kiliczsh/ailandscape.org"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        Contribute on GitHub
      </a>
    </footer>
  );
}

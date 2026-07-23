# ailandscape.org — AI Ecosystem Landscape

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tools tracked](https://img.shields.io/endpoint?url=https://ailandscape.org/count.json&color=2a54d4)](https://ailandscape.org)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org)
[![Deployed on Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=fff)](https://workers.cloudflare.com)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A comprehensive, interactive map of the AI tools ecosystem — categorized, validated, and updated continuously. Inspired by the [CNCF Landscape](https://landscape.cncf.io).

🔗 **Live:** [ailandscape.org](https://ailandscape.org/?utm_source=github&utm_medium=readme&utm_campaign=organic) · 📡 **RSS:** [feed.xml](https://ailandscape.org/feed.xml) · ➕ **Submit a tool:** [/submit](https://ailandscape.org/submit)

---

## Why star this?

If the AI tooling space moves fast enough that a static catalog isn't enough — **star to follow**. We curate, validate, and add new tools every week. Recently added tools land on the home page and the [RSS feed](https://ailandscape.org/feed.xml).

## Features

- **Hundreds of tools** across 26 categories and 6 groups
- **Per-category landing pages** at `/category/[slug]` for focused browsing
- **Per-tool detail pages** at `/tool/[slug]` with related items
- **Full-text search** with fuzzy matching and ⌘K command palette
- **Tag-based filtering** — click any badge to filter
- **Dark mode** — full light/dark theme support
- **Shareable URLs** — every filter state is reflected in the URL
- **Recently Added** strip + RSS feed for keeping up with new entries
- **Keyboard accessible** — full keyboard navigation, ARIA, screen reader friendly

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)
- [Phosphor Icons](https://phosphoricons.com)
- [Biome](https://biomejs.dev) for linting and formatting
- Data stored as YAML files in `src/data/categories/`
- Deployed on Cloudflare Workers

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Commands

```bash
make dev            # start dev server
make build          # production build
make format         # auto-format with Biome
make fix            # auto-fix lint issues
make lint           # check for lint errors
make validate       # validate YAML structure + tags
```

## Data Structure

Each category is a YAML file in `src/data/categories/`. Files are loaded alphabetically; the numeric prefix controls display order.

```yaml
name: Frontier Labs
group: core-ai                     # core-ai | infrastructure | engineering | products | governance | ecosystem
color: "oklch(0.62 0.22 230)"      # OKLCH color token for category accent
icon: Buildings                    # Phosphor icon name
subcategories:
  - name: Open Research Labs
    items:                         # sorted A–Z by name within each subcategory
      - name: Nous Research
        homepage_url: https://nousresearch.com
        repo_url: https://github.com/NousResearch    # optional
        logo: nous-research.webp                     # filename inside public/logos/
        crunchbase: https://www.crunchbase.com/organization/nous-research  # optional
        twitter_url: https://x.com/NousResearch      # optional
        project: graduated                           # optional: graduated | incubating | sandbox
        description: "Open-weights research lab known for Hermes and Nous-Capybara models"
        tags: [lab, llm, open-weights, research]
        added_at: 2026-05-08                         # optional — powers Recently Added + RSS
```

Tags are defined in `src/data/tags.yaml`. Every tag used in a category file must have an entry there.

## Contributing

We have **two ways** to contribute:

1. **Submit form** — [ailandscape.org/submit](https://ailandscape.org/submit) opens a pre-filled GitHub issue you can review and submit. No coding required.
2. **Pull request** — see [CONTRIBUTING.md](CONTRIBUTING.md) for the YAML schema, validation rules, and PR checklist.

Both routes are equally welcome.

## License

[MIT](LICENSE)

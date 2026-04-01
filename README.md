# ailandscape.org — AI Ecosystem Landscape

A comprehensive, interactive map of the AI tools ecosystem. Browse tools across models, infrastructure, protocols, security, and product categories — inspired by the [CNCF Landscape](https://landscape.cncf.io).

Live at [ailandscape.org](https://ailandscape.org/?utm_source=github&utm_medium=readme&utm_campaign=organic).

## Features

- **Hundreds of tools** across multiple categories and groups
- **Full-text search** with fuzzy matching and ⌘K command palette
- **Tag-based filtering** — click any badge to filter by technology
- **Category navigation** — collapse/expand, group-level filtering
- **Dark mode** — full light/dark theme support
- **Shareable URLs** — every filter state is reflected in the URL
- **Keyboard accessible** — full keyboard navigation, ARIA labels, screen reader friendly

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)
- [Phosphor Icons](https://phosphoricons.com)
- [Biome](https://biomejs.dev) for linting and formatting
- Data stored as YAML files in `src/data/categories/`

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
```

Tags are defined in `src/data/tags.yaml`. Every tag used in a category file must have an entry there.

## Adding a Tool

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## License

[MIT](LICENSE)

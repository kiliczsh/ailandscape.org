# Contributing to AILand

Contributions welcome! You can:

- Add or update entries in an existing category
- Fix incorrect data (URL, description, logo, tags)
- Add a new category or subcategory
- Improve the UI, performance, or accessibility

---

## Data

All landscape data lives in `src/data/categories/` — one YAML file per category. Files are loaded alphabetically; the numeric prefix controls display order.

### Entry schema

Keys must appear in this order (omit fields that don't apply):

```yaml
name: Entry Name                                  # required
homepage_url: https://example.com                 # required
repo_url: https://github.com/org/repo            # optional — source repo
logo: filename.webp                               # optional — file in public/logos/
crunchbase: https://www.crunchbase.com/organization/example  # optional
twitter_url: https://x.com/example               # optional
project: graduated                                # optional — graduated | incubating | sandbox
description: "One sentence describing what it does"  # recommended, ≤80 chars
tags: [tag-a, tag-b]                             # recommended
```

**Description:** one sentence, ≤80 chars, no trailing period. Describe what it *does*, not what it *is*.

**Item order:** entries within a subcategory must be sorted **alphabetically (A–Z, case-insensitive)** by name.

### Logos

Place `.webp` files in `public/logos/` (128×128 px, <20 KB recommended). The `logo:` field must match the filename exactly. If omitted, the UI shows initials.

### Tags

Every tag must have an entry in `src/data/tags.yaml`:

```yaml
my-tag:
  label: My Tag
  color: "oklch(0.65 0.18 220)"
```

### New category

Create `src/data/categories/NN-name.yaml`:

```yaml
name: Category Name
group: infrastructure    # core-ai | infrastructure | engineering | products | governance | ecosystem
color: "oklch(0.60 0.20 180)"
icon: IconName           # Phosphor icon — https://phosphoricons.com
subcategories:
  - name: Subcategory
    items: []
```

### Validate

```bash
make validate
```

Must pass with zero errors before opening a PR.

---

## Code

```
make format   →   make fix   →   make lint   →   make build
```

All four steps must pass. A few notes:

- Icons: `@phosphor-icons/react` only
- Formatting: Biome, 2-space indent

---

## PR checklist

- [ ] `make validate` passes (zero errors, zero warnings)
- [ ] `make lint` passes
- [ ] `make build` compiles cleanly
- [ ] Logo is `.webp` in `public/logos/` (if applicable)
- [ ] Description ≤80 chars, no trailing period
- [ ] All tags resolve in `tags.yaml`
- [ ] Item keys in canonical order
- [ ] Items sorted alphabetically within subcategory

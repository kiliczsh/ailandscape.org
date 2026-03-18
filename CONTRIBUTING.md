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

```yaml
name: Entry Name
homepage_url: https://example.com
logo: filename.webp        # file in public/logos/ — omit if unavailable
description: "One sentence describing what it does"
github_url: https://github.com/org/repo   # optional
tags: [tag-a, tag-b]
```

**Description:** one sentence, ~80 chars max, no trailing period. Describe what it *does*, not what it *is*.

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
group: infrastructure    # labs | models | infrastructure | protocols | security | product
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

- [ ] `make validate` passes
- [ ] `make lint` passes
- [ ] `make build` compiles cleanly
- [ ] Logo is `.webp` in `public/logos/` (if applicable)
- [ ] Description ≤80 chars, no trailing period
- [ ] All tags resolve in `tags.yaml`

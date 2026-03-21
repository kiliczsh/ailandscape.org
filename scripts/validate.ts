#!/usr/bin/env npx tsx
/**
 * Landscape data validator
 *
 * Usage:
 *   npm run validate
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { Category } from "../src/types/landscape";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Constants mirrored from category-row.tsx ──────────────────────────────────

const VALID_GROUPS = new Set([
  "labs",
  "models",
  "infrastructure",
  "protocols",
  "security",
  "product",
]);

const VALID_ICONS = new Set([
  "ArrowsLeftRight",
  "Brain",
  "Buildings",
  "ChartLine",
  "ChatText",
  "Code",
  "Cube",
  "Database",
  "GitBranch",
  "Graph",
  "HardDrives",
  "Image",
  "Intersect",
  "MagnifyingGlass",
  "Plug",
  "Robot",
  "ShieldCheck",
  "Waveform",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROOT = join(__dirname, "..");
const LOGOS_DIR = join(ROOT, "public", "logos");
const CATEGORIES_DIR = join(ROOT, "src", "data", "categories");

let errors = 0;
let warnings = 0;

function err(msg: string) {
  console.error(`  \x1b[31m✖\x1b[0m ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  \x1b[33m⚠\x1b[0m ${msg}`);
  warnings++;
}

function ok(msg: string) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}

function section(title: string) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

// ── 1. YAML parse ─────────────────────────────────────────────────────────────

section("1. YAML parse");

const files = readdirSync(CATEGORIES_DIR)
  .filter((f) => f.endsWith(".yaml"))
  .sort();

const categories: Array<{ file: string; data: Category }> = [];

for (const file of files) {
  const filePath = join(CATEGORIES_DIR, file);
  try {
    const raw = readFileSync(filePath, "utf8");
    const data = parse(raw) as Category;
    categories.push({ file, data });
  } catch (e) {
    err(`${file}: ${e}`);
  }
}

ok(`Parsed ${categories.length} / ${files.length} files`);

// ── 2. Required fields ────────────────────────────────────────────────────────

section("2. Required fields");

for (const { file, data } of categories) {
  if (!data.name) err(`${file}: missing category name`);

  for (const sub of data.subcategories ?? []) {
    if (!sub.name) err(`${file}: subcategory missing name`);

    for (const item of sub.items ?? []) {
      if (!item.name) err(`${file} › ${sub.name}: item missing name`);
    }
  }
}

ok("Required field check complete");

// ── 3. Valid group / icon values ──────────────────────────────────────────────

section("3. Valid group / icon values");

for (const { file, data } of categories) {
  if (data.group && !VALID_GROUPS.has(data.group)) {
    err(`${file}: unknown group "${data.group}"`);
  }
  if (data.icon && !VALID_ICONS.has(data.icon)) {
    warn(`${file}: unknown icon "${data.icon}" (will fall back to Shapes)`);
  }
  if (data.color && !/^oklch\(/.test(data.color)) {
    warn(`${file}: color "${data.color}" is not an oklch() value`);
  }
}

ok("Group / icon check complete");

// ── 4. Logo files ─────────────────────────────────────────────────────────────

section("4. Logo files");

const logoDirExists = existsSync(LOGOS_DIR);
if (!logoDirExists) {
  warn("public/logos/ directory does not exist — skipping logo file checks");
}

const missingLogos = new Set<string>();

for (const { data } of categories) {
  for (const sub of data.subcategories ?? []) {
    for (const item of sub.items ?? []) {
      if (item.logo) {
        const logoPath = join(LOGOS_DIR, item.logo);
        if (logoDirExists && !existsSync(logoPath)) {
          missingLogos.add(item.logo);
        }
      }
    }
  }
}

if (missingLogos.size > 0) {
  console.log(
    `  \x1b[2m⊘ ${missingLogos.size} missing logo file(s) — suppressed (initials fallback active)\x1b[0m`,
  );
} else if (logoDirExists) {
  ok("All logo files present");
}

// ── 5. Tag definitions ────────────────────────────────────────────────────────

section("5. Tag definitions");

const TAGS_FILE = join(ROOT, "src", "data", "tags.yaml");
let knownTags = new Set<string>();

try {
  const tagsRaw = readFileSync(TAGS_FILE, "utf8");
  const tagsData = parse(tagsRaw) as Record<string, unknown>;
  knownTags = new Set(Object.keys(tagsData));
  ok(`Loaded ${knownTags.size} tags from tags.yaml`);
} catch (e) {
  err(`Failed to load tags.yaml: ${e}`);
}

const undefinedTags = new Map<string, string>();

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    for (const item of sub.items ?? []) {
      for (const tag of item.tags ?? []) {
        if (!knownTags.has(tag) && !undefinedTags.has(tag)) {
          err(
            `Undefined tag "${tag}" on "${item.name}" in ${file} — add it to tags.yaml`,
          );
          undefinedTags.set(tag, `${file} › ${item.name}`);
        }
      }
    }
  }
}

if (undefinedTags.size === 0 && knownTags.size > 0) ok("All tags defined");

// ── 6. Duplicate item names ───────────────────────────────────────────────────

section("6. Duplicate item names");

const seen = new Map<string, string>();

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    for (const item of sub.items ?? []) {
      const key = item.name.toLowerCase().trim();
      const loc = `${file} › ${sub.name}`;
      if (seen.has(key)) {
        err(`Duplicate: "${item.name}" in ${loc} (also in ${seen.get(key)})`);
      } else {
        seen.set(key, loc);
      }
    }
  }
}

ok("Duplicate check complete");

// ── 7. Empty subcategories ────────────────────────────────────────────────────

section("7. Empty subcategories");

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    if (!sub.items || sub.items.length === 0) {
      warn(`${file} › "${sub.name}" has no items`);
    }
  }
}

ok("Empty subcategory check complete");

// ── 8. Description quality ────────────────────────────────────────────────────

section("8. Description quality");

let descIssues = 0;

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    for (const item of sub.items ?? []) {
      const desc = item.description as string | undefined;
      if (!desc) continue;
      if (desc.length > 80) {
        warn(
          `${file} › "${item.name}": description too long (${desc.length} chars, max 80)`,
        );
        descIssues++;
      }
      if (desc.trimEnd().endsWith(".")) {
        warn(`${file} › "${item.name}": description has trailing period`);
        descIssues++;
      }
    }
  }
}

if (descIssues === 0) ok("All descriptions within limits");

// ── 9. Item key order ─────────────────────────────────────────────────────────

section("9. Item key order");

const CANONICAL_KEY_ORDER = [
  "name",
  "homepage_url",
  "repo_url",
  "logo",
  "crunchbase",
  "twitter_url",
  "project",
  "description",
  "tags",
];

let keyOrderIssues = 0;

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    for (const item of sub.items ?? []) {
      const keys = Object.keys(item);
      const known = CANONICAL_KEY_ORDER.filter((k) => keys.includes(k));
      const unknown = keys.filter((k) => !CANONICAL_KEY_ORDER.includes(k));
      const expected = [...known, ...unknown];
      if (!keys.every((k, i) => k === expected[i])) {
        warn(
          `${file} › "${item.name}": key order [${keys.join(", ")}] — expected [${expected.join(", ")}]`,
        );
        keyOrderIssues++;
      }
    }
  }
}

if (keyOrderIssues === 0) ok("All item keys in canonical order");

// ── 9. Alphabetical item sort ─────────────────────────────────────────────────

section("10. Alphabetical item sort");

let sortIssues = 0;

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    const items = sub.items ?? [];
    const names = items.map((i) => i.name);
    const sorted = [...names].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
    const firstUnsorted = names.find((n, i) => n !== sorted[i]);
    if (firstUnsorted) {
      warn(
        `${file} › "${sub.name}": items not sorted (first: "${firstUnsorted}")`,
      );
      sortIssues++;
    }
  }
}

if (sortIssues === 0) ok("All subcategory items sorted alphabetically");

// ── 10. URL field formats ──────────────────────────────────────────────────────

section("11. URL field formats");

let urlIssues = 0;

for (const { file, data } of categories) {
  for (const sub of data.subcategories ?? []) {
    for (const item of sub.items ?? []) {
      if (item.twitter_url) {
        const u = item.twitter_url as string;
        if (!/^https?:\/\/(www\.)?(x\.com|twitter\.com)\//.test(u)) {
          warn(
            `${file} › "${item.name}": twitter_url "${u}" is not an x.com/twitter.com URL`,
          );
          urlIssues++;
        }
      }
      if (item.crunchbase) {
        const u = item.crunchbase as string;
        if (!u.includes("crunchbase.com")) {
          warn(
            `${file} › "${item.name}": crunchbase "${u}" is not a crunchbase.com URL`,
          );
          urlIssues++;
        }
      }
    }
  }
}

if (urlIssues === 0) ok("URL field formats valid");

// ── Summary ───────────────────────────────────────────────────────────────────

const totalItems = categories.reduce(
  (sum, { data }) =>
    sum +
    (data.subcategories ?? []).reduce(
      (s, sub) => s + (sub.items ?? []).length,
      0,
    ),
  0,
);

console.log(`
\x1b[1mSummary\x1b[0m
  Categories : ${categories.length}
  Total items: ${totalItems}
  Errors     : \x1b[${errors > 0 ? "31" : "32"}m${errors}\x1b[0m
  Warnings   : \x1b[${warnings > 0 ? "33" : "32"}m${warnings}\x1b[0m
`);

if (errors > 0) process.exit(1);

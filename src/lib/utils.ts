import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Escape JSON for safe embedding inside <script type="application/ld+json">.
// Without this, a tool description containing "</script>" would close the tag
// and corrupt the page. JSON.stringify alone does not escape these sequences.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/<\/(script)/gi, "<\\/$1")
    .replace(/<!--/g, "<\\!--");
}

const GROUP_LABELS: Record<string, string> = {
  "core-ai": "Core AI",
  infrastructure: "Infrastructure",
  engineering: "Engineering",
  products: "Products",
  governance: "Governance",
  ecosystem: "Ecosystem",
};

export function humanizeGroup(group?: string): string {
  if (!group) return "Category";
  return GROUP_LABELS[group] ?? group;
}

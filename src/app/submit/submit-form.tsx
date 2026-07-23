"use client";

import { ArrowSquareOut, GithubLogo } from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface CategoryOption {
  name: string;
  subcategories: string[];
}

interface SubmitFormProps {
  categories: CategoryOption[];
}

const REPO = "kiliczsh/ailandscape.org";
const DESC_MAX = 80;

function buildIssueUrl(formValues: {
  name: string;
  homepage_url: string;
  category: string;
  subcategory: string;
  description: string;
  repo_url: string;
  twitter_url: string;
  logo_url: string;
  notes: string;
}): string {
  const title = `Add tool: ${formValues.name}`;
  const body = [
    "## Tool details",
    "",
    `**Name:** ${formValues.name}`,
    "",
    `**Homepage URL:** ${formValues.homepage_url}`,
    "",
    `**Category / Subcategory:** ${formValues.category}${
      formValues.subcategory ? ` → ${formValues.subcategory}` : ""
    }`,
    "",
    `**Description (one sentence, ≤80 chars):** ${formValues.description}`,
    "",
    `**Repo URL (optional):** ${formValues.repo_url || "—"}`,
    "",
    `**Twitter / X URL (optional):** ${formValues.twitter_url || "—"}`,
    "",
    `**Logo available?** ${formValues.logo_url || "—"}`,
    "",
    "---",
    "",
    formValues.notes || "<!-- Optional: why should this tool be included? -->",
    "",
    "<sub>Submitted via ailandscape.org/submit</sub>",
  ].join("\n");

  const params = new URLSearchParams({
    title,
    body,
    labels: "data",
    template: "add_tool.md",
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const [name, setName] = useState("");
  const [homepageUrl, setHomepageUrl] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ids = {
    name: useId(),
    homepage: useId(),
    category: useId(),
    subcategory: useId(),
    description: useId(),
    repo: useId(),
    twitter: useId(),
    logo: useId(),
    notes: useId(),
  };

  useEffect(() => {
    trackEvent("submit_form_open");
  }, []);

  const subcategoryOptions = useMemo(() => {
    const cat = categories.find((c) => c.name === categoryName);
    return cat?.subcategories ?? [];
  }, [categories, categoryName]);

  const descLeft = DESC_MAX - description.length;
  const descOver = descLeft < 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !homepageUrl || !categoryName || !description) return;

    const url = buildIssueUrl({
      name,
      homepage_url: homepageUrl,
      category: categoryName,
      subcategory: subcategoryName,
      description,
      repo_url: repoUrl,
      twitter_url: twitterUrl,
      logo_url: logoUrl,
      notes,
    });

    trackEvent("submit_form_complete", { category: categoryName });

    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        id={ids.name}
        label="Tool name"
        required
        value={name}
        onChange={setName}
        placeholder="e.g. Anthropic"
      />

      <Field
        id={ids.homepage}
        label="Homepage URL"
        type="url"
        required
        value={homepageUrl}
        onChange={setHomepageUrl}
        placeholder="https://example.com"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={ids.category}
            className="text-xs font-semibold text-foreground"
          >
            Category <span className="text-destructive">*</span>
          </label>
          <select
            id={ids.category}
            required
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setSubcategoryName("");
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={ids.subcategory}
            className="text-xs font-semibold text-foreground"
          >
            Subcategory{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <select
            id={ids.subcategory}
            value={subcategoryName}
            onChange={(e) => setSubcategoryName(e.target.value)}
            disabled={!categoryName}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">
              {categoryName ? "Choose a subcategory…" : "Pick a category first"}
            </option>
            {subcategoryOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={ids.description}
          className="flex items-center justify-between text-xs font-semibold text-foreground"
        >
          <span>
            Description <span className="text-destructive">*</span>
          </span>
          <span
            className={`tabular-nums ${
              descOver
                ? "text-destructive"
                : descLeft < 10
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
            }`}
          >
            {description.length} / {DESC_MAX}
          </span>
        </label>
        <textarea
          id={ids.description}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="One sentence describing what it does (no trailing period)"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Field
        id={ids.repo}
        label="Repository URL"
        type="url"
        optional
        value={repoUrl}
        onChange={setRepoUrl}
        placeholder="https://github.com/org/repo"
      />

      <Field
        id={ids.twitter}
        label="Twitter / X URL"
        type="url"
        optional
        value={twitterUrl}
        onChange={setTwitterUrl}
        placeholder="https://x.com/example"
      />

      <Field
        id={ids.logo}
        label="Logo URL (square, 128×128 ideal)"
        type="url"
        optional
        value={logoUrl}
        onChange={setLogoUrl}
        placeholder="https://example.com/logo.png"
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={ids.notes}
          className="text-xs font-semibold text-foreground"
        >
          Anything else?{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id={ids.notes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Why should this tool be included? Adoption, relevance, category fit…"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={
            !name || !homepageUrl || !categoryName || !description || descOver
          }
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <GithubLogo size={15} aria-hidden="true" />
          Open pre-filled GitHub issue
          <ArrowSquareOut size={13} aria-hidden="true" />
        </button>
        {submitted && (
          <output className="text-xs text-muted-foreground" aria-live="polite">
            A new tab opened with your submission. Click "Submit new issue" on
            GitHub to finish.
          </output>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
  optional = false,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {optional && (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

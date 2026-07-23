import type { Metadata } from "next";
import { getLandscapeData } from "@/data/landscape";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit a tool — AI Landscape",
  description:
    "Suggest a new AI tool, framework, or service for the AI Landscape. Open submission powered by GitHub.",
  alternates: { canonical: "https://ailandscape.org/submit" },
  openGraph: {
    title: "Submit a tool — AI Landscape",
    description: "Suggest a new AI tool for the AI Landscape.",
    type: "website",
  },
};

export default function SubmitPage() {
  const data = getLandscapeData();

  const categories = data.landscape.map((cat) => ({
    name: cat.name,
    subcategories: cat.subcategories.map((s) => s.name),
  }));

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-10">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Open contribution
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Submit a tool
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Know an AI tool that belongs on the landscape? Fill the form below —
          we'll open a pre-filled GitHub issue you can review and submit. You
          need a free GitHub account to file the issue.
        </p>
      </header>

      <SubmitForm categories={categories} />

      <aside className="mt-10 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">
          Prefer to open a PR directly?
        </p>
        <p className="mt-1">
          See{" "}
          <a
            href="https://github.com/kiliczsh/ailandscape.org/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            CONTRIBUTING.md
          </a>{" "}
          for the YAML schema, validation rules, and PR checklist.
        </p>
      </aside>
    </div>
  );
}

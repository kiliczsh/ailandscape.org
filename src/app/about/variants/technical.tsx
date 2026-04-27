import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CategoryGroup } from "@/types/landscape";
import type { AboutStats } from "../shared";
import { GROUP_META } from "../shared";

export function TechnicalAbout({ stats }: { stats: AboutStats }) {
  const {
    totalItems,
    totalCategories,
    totalSubcategories,
    openSourceItems,
    groupCounts,
  } = stats;

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header row */}
        <div className="border-b border-border py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                ailandscape.org/about
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                AI Landscape
              </h1>
            </div>
            <div className="flex gap-3">
              <a
                href="https://github.com/kiliczsh/ailandscape.org/issues/new/choose"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              >
                Submit a tool
              </a>
              <a
                href="https://github.com/kiliczsh/ailandscape.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              >
                <GithubLogo size={12} aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Stats — monospace numbers */}
        <div className="border-b border-border py-8">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                { value: totalItems, label: "items" },
                { value: totalCategories, label: "categories" },
                { value: totalSubcategories, label: "subcategories" },
                { value: openSourceItems, label: "open_source" },
              ] as const
            ).map(({ value, label }) => (
              <div key={label} className="rounded border border-border p-3">
                <dd className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {value.toLocaleString()}
                </dd>
                <dt className="mt-1 font-mono text-[0.6875rem] text-muted-foreground">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Description */}
        <div className="border-b border-border py-8">
          <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
            <p className="font-mono text-xs text-muted-foreground">
              description
            </p>
            <div className="space-y-3">
              <p className="text-base text-pretty text-foreground">
                AI Landscape is a free, open source directory of every
                significant AI tool, framework, model, and service. Inspired by
                the CNCF Landscape, it's built to be comprehensive, browsable,
                and always improving.
              </p>
              <p className="text-base text-pretty text-muted-foreground">
                The AI space moves faster than any single person can track. This
                project exists to give developers, researchers, and
                decision-makers a single structured view of the entire
                ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Groups — table-like */}
        <div className="border-b border-border py-8">
          <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
            <p className="font-mono text-xs text-muted-foreground">groups</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-mono text-[0.6875rem] font-normal text-muted-foreground">
                    name
                  </th>
                  <th className="pb-2 text-right font-mono text-[0.6875rem] font-normal text-muted-foreground">
                    categories
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  Object.entries(GROUP_META) as [
                    CategoryGroup,
                    { label: string; color: string },
                  ][]
                ).map(([key, { label, color }]) => (
                  <tr
                    key={key}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-2">
                      <Link
                        href={`/?group=${key}`}
                        className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
                      >
                        <span
                          className="size-2 shrink-0 rounded-sm"
                          style={{ backgroundColor: color }}
                        />
                        {label}
                      </Link>
                    </td>
                    <td className="py-2 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {groupCounts[key] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contribute */}
        <div className="py-8">
          <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
            <p className="font-mono text-xs text-muted-foreground">
              contributing
            </p>
            <p className="max-w-[48ch] text-base text-pretty text-muted-foreground">
              The dataset lives in{" "}
              <a
                href="https://github.com/kiliczsh/ailandscape.org/tree/main/src/data/categories"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-foreground underline underline-offset-4 hover:text-primary"
              >
                src/data/categories
              </a>
              . Every addition is a pull request. Open an issue to suggest a
              tool or report an outdated entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

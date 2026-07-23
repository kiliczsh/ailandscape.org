"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  Buildings,
  GithubLogo,
  Tag as TagIcon,
  XLogo,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ItemAvatar } from "@/components/landscape/item-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toSlug } from "@/lib/slug";
import { appendUtm } from "@/lib/utm";
import {
  categorySlug,
  getTagTextColor,
  ProjectStatusBadge,
  type ToolDetailProps,
} from "../shared";

export function SidebarProfile({
  item,
  category,
  subcategory,
  tags,
  related,
}: ToolDetailProps) {
  const accent = category.color ?? "var(--category-default-color)";
  const catSlug = categorySlug(category.name);

  return (
    <div className="flex-1 bg-background">
      <div
        aria-hidden="true"
        className="h-1 w-full"
        style={{ backgroundColor: accent }}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[300px_1fr] lg:gap-10 lg:py-12">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} weight="bold" aria-hidden="true" />
            <span>All tools</span>
          </Link>

          <div className="rounded-xl border border-border bg-card p-5">
            <div
              className="mx-auto mb-4 size-20 overflow-hidden rounded-lg border border-border bg-background"
              style={{ borderColor: accent }}
            >
              <ItemAvatar
                name={item.name}
                logo={item.logo}
                containerClass="size-full rounded-lg"
                priority
              />
            </div>

            <h1 className="max-w-[20ch] text-center text-2xl font-semibold tracking-tight text-balance text-foreground">
              {item.name}
            </h1>

            <p className="mt-1 text-center text-xs text-muted-foreground">
              <Link
                href={`/?category=${catSlug}`}
                className="transition-colors hover:text-foreground"
                style={{ color: accent }}
              >
                {category.name}
              </Link>
              <span className="text-muted-foreground/40"> · </span>
              <span>{subcategory.name}</span>
            </p>

            {item.project && (
              <div className="mt-3 flex justify-center">
                <ProjectStatusBadge status={item.project} />
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              {item.homepage_url && (
                <Button
                  asChild
                  className="h-9 w-full justify-center gap-1.5 py-2"
                >
                  <a
                    href={appendUtm(item.homepage_url, "website")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowSquareOut
                      size={14}
                      weight="bold"
                      aria-hidden="true"
                    />
                    Visit website
                  </a>
                </Button>
              )}
              {item.repo_url && (
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-center gap-1.5 py-2"
                >
                  <a
                    href={appendUtm(item.repo_url, "repo")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubLogo size={14} weight="bold" aria-hidden="true" />
                    GitHub
                  </a>
                </Button>
              )}
              {item.twitter_url && (
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-center gap-1.5 py-2"
                >
                  <a
                    href={appendUtm(item.twitter_url, "x")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <XLogo size={14} weight="bold" aria-hidden="true" />X /
                    Twitter
                  </a>
                </Button>
              )}
              {item.crunchbase && (
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-center gap-1.5 py-2"
                >
                  <a
                    href={item.crunchbase}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Buildings size={14} weight="bold" aria-hidden="true" />
                    Crunchbase
                  </a>
                </Button>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h2>
            <p className="mt-3 max-w-[60ch] text-lg text-pretty text-foreground">
              {item.description ??
                `${item.name} is part of the ${subcategory.name} ecosystem.`}
            </p>
          </section>

          {item.tags && item.tags.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-2">
                <TagIcon
                  size={14}
                  aria-hidden="true"
                  className="text-muted-foreground"
                />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags
                </h2>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => {
                  const meta = tags[tag];
                  return (
                    <li key={tag}>
                      <Link
                        href={`/?tag=${encodeURIComponent(tag)}`}
                        className="rounded transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 text-xs"
                          style={
                            meta?.color
                              ? {
                                  backgroundColor: meta.color,
                                  color: getTagTextColor(meta.color),
                                }
                              : undefined
                          }
                        >
                          {meta?.label ?? tag}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
            See something off?{" "}
            <a
              href={`https://github.com/kiliczsh/ailandscape.org/issues/new?template=fix_data.md&title=${encodeURIComponent(
                `Fix data: ${item.name}`,
              )}&body=${encodeURIComponent(
                `**Tool:** ${item.name}\n**URL:** https://ailandscape.org/tool/${toSlug(item.name)}\n\n**What's wrong:**\n\n**Suggested fix:**\n`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Suggest an edit
            </a>
          </div>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related in {subcategory.name}
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((rel) => (
                  <li key={rel.name}>
                    <Link
                      href={`/tool/${toSlug(rel.name)}`}
                      className="flex w-full items-center gap-2 rounded border-2 border-border bg-card px-2 py-1.5 transition-[transform,box-shadow] duration-150 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ borderColor: accent }}
                    >
                      <div className="size-8 shrink-0 overflow-hidden rounded">
                        <ItemAvatar
                          name={rel.name}
                          logo={rel.logo}
                          containerClass="size-full rounded"
                        />
                      </div>
                      <span className="min-w-0 truncate text-sm text-foreground">
                        {rel.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

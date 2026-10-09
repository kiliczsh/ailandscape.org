"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/use-locale";
import { toSlug } from "@/lib/slug";

export function FooterCategoryLinks({ names }: { names: string[] }) {
  const { prefix, categoryLabel } = useLocale();
  return names.map((name) => (
    <Link
      key={name}
      href={`${prefix}/category/${toSlug(name)}`}
      prefetch={false}
      className="transition-colors hover:text-foreground"
    >
      {categoryLabel(name)}
    </Link>
  ));
}

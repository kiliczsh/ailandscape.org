"use client";

import { Asterisk } from "@phosphor-icons/react";

const ITEMS = [
  "The complete map of the AI ecosystem",
  "1,000+ AI tools and frameworks mapped",
  "Models · Infrastructure · Product · Security",
  "Open source landscape — contribute anytime",
  "Filter, search, and compare tools instantly",
  "Discover the tools shaping the future of AI",
];

export function IntroBanner() {
  const items = [...ITEMS, ...ITEMS];

  return (
    <div
      aria-hidden="true"
      className="group overflow-hidden cursor-default"
      style={{ backgroundColor: "var(--marquee-bg)" }}
    >
      <div
        className="flex w-max whitespace-nowrap py-1.5 group-hover:[animation-play-state:paused]"
        style={{
          willChange: "transform",
          animation: "marquee 50s linear infinite",
        }}
      >
        {items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static marquee list never reorders
          <span key={i} className="flex items-center">
            <span className="px-5 text-xs font-semibold text-white">
              {item}
            </span>
            <Asterisk
              size={10}
              weight="bold"
              className="text-white/60 shrink-0"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

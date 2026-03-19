"use client";

import { X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LandscapeItem } from "@/types/landscape";
import { ItemAvatar } from "./item-card";

type Tier = "S+" | "S" | "A" | "B" | "C" | "D";

const TIERS: { id: Tier; color: string; textColor: string }[] = [
  { id: "S+", color: "oklch(0.48 0.24 25)", textColor: "#fff" },
  { id: "S", color: "oklch(0.55 0.22 35)", textColor: "#fff" },
  { id: "A", color: "oklch(0.65 0.19 50)", textColor: "#fff" },
  { id: "B", color: "oklch(0.72 0.16 90)", textColor: "oklch(0.2 0.08 90)" },
  { id: "C", color: "oklch(0.62 0.15 145)", textColor: "#fff" },
  { id: "D", color: "oklch(0.55 0.13 240)", textColor: "#fff" },
];

function storageKey(categoryName: string) {
  return `tierlist-${categoryName}`;
}

function loadTiers(categoryName: string): Record<string, Tier> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(categoryName));
    return raw ? (JSON.parse(raw) as Record<string, Tier>) : {};
  } catch {
    return {};
  }
}

function saveTiers(categoryName: string, state: Record<string, Tier>) {
  try {
    localStorage.setItem(storageKey(categoryName), JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

interface TierItemProps {
  item: LandscapeItem;
  currentTier: Tier | null;
  onAssign: (itemName: string, tier: Tier | null) => void;
}

function TierItem({ item, currentTier, onAssign }: TierItemProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={item.name}
        onClick={() => setPickerOpen((o) => !o)}
        className="flex flex-col items-center gap-0.5 rounded border border-border bg-card p-1 cursor-pointer hover:scale-105 hover:shadow-md transition-[transform,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ minWidth: 52 }}
      >
        <div className="w-10 h-10 shrink-0 overflow-hidden rounded">
          <ItemAvatar
            name={item.name}
            logo={item.logo}
            containerClass="h-full w-full rounded"
          />
        </div>
        <span className="w-12 line-clamp-1 text-center text-[9px] leading-tight text-foreground">
          {item.name}
        </span>
      </button>

      {pickerOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 flex items-center gap-0.5 rounded border border-border bg-popover p-1 shadow-lg">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onAssign(item.name, currentTier === t.id ? null : t.id);
                setPickerOpen(false);
              }}
              className="flex h-6 w-8 items-center justify-center rounded text-xs font-bold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={{
                backgroundColor: t.color,
                color: t.textColor,
                outline: currentTier === t.id ? `2px solid white` : "none",
                outlineOffset: currentTier === t.id ? "-2px" : undefined,
              }}
            >
              {t.id}
            </button>
          ))}
          {currentTier && (
            <button
              type="button"
              title="Unrank"
              onClick={() => {
                onAssign(item.name, null);
                setPickerOpen(false);
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface TierListPanelProps {
  categoryName: string;
  items: LandscapeItem[];
  onClose: () => void;
}

export function TierListPanel({
  categoryName,
  items,
  onClose,
}: TierListPanelProps) {
  const [tierState, setTierState] = useState<Record<string, Tier>>(() =>
    loadTiers(categoryName),
  );

  const handleAssign = useCallback(
    (itemName: string, tier: Tier | null) => {
      setTierState((prev) => {
        const next = { ...prev };
        if (tier === null) {
          delete next[itemName];
        } else {
          next[itemName] = tier;
        }
        saveTiers(categoryName, next);
        return next;
      });
    },
    [categoryName],
  );

  const unranked = items.filter((item) => !tierState[item.name]);

  return (
    <div className="border-t border-border bg-muted/40">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Tier List — {categoryName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            Click an item to assign a tier
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tier list"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tier rows */}
      <div className="flex flex-col">
        {TIERS.map((tier) => {
          const tieredItems = items.filter(
            (item) => tierState[item.name] === tier.id,
          );
          return (
            <div
              key={tier.id}
              className="flex items-stretch border-b border-border last:border-b-0 min-h-[60px]"
            >
              {/* Tier label */}
              <div
                className="flex w-12 shrink-0 items-center justify-center text-sm font-black"
                style={{ backgroundColor: tier.color, color: tier.textColor }}
              >
                {tier.id}
              </div>
              {/* Items */}
              <div className="flex flex-1 flex-wrap items-center gap-1.5 px-2 py-1.5 bg-card/50">
                {tieredItems.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground/40 italic">
                    — empty —
                  </span>
                ) : (
                  tieredItems.map((item) => (
                    <TierItem
                      key={item.name}
                      item={item}
                      currentTier={tierState[item.name] ?? null}
                      onAssign={handleAssign}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unranked pool */}
      <div className="border-t border-border">
        <div className="flex items-stretch min-h-[64px]">
          <div className="flex w-12 shrink-0 items-center justify-center bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
            <span
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Unranked
            </span>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-1.5 px-2 py-1.5">
            {unranked.length === 0 ? (
              <span className="text-[10px] text-muted-foreground italic">
                All items ranked!
              </span>
            ) : (
              unranked.map((item) => (
                <TierItem
                  key={item.name}
                  item={item}
                  currentTier={null}
                  onAssign={handleAssign}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

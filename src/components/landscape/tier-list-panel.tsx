"use client";

import { X } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { useLandscapeFilter } from "@/contexts/landscape-filter-context";
import type { LandscapeItem, Subcategory } from "@/types/landscape";
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

function storageKey(categoryName: string, subName: string) {
  return `tierlist-${categoryName}__${subName}`;
}

function loadTiers(
  categoryName: string,
  subName: string,
): Record<string, Tier> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(categoryName, subName));
    return raw ? (JSON.parse(raw) as Record<string, Tier>) : {};
  } catch {
    return {};
  }
}

function saveTiers(
  categoryName: string,
  subName: string,
  state: Record<string, Tier>,
) {
  try {
    localStorage.setItem(
      storageKey(categoryName, subName),
      JSON.stringify(state),
    );
  } catch {
    // ignore quota errors
  }
}

// ── Item card in tier row ─────────────────────────────────────────────────────

interface TierItemProps {
  item: LandscapeItem;
}

function TierItem({ item }: TierItemProps) {
  const { onItemClick } = useLandscapeFilter();

  return (
    <button
      type="button"
      title={item.name}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.name);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onItemClick(item.name)}
      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-1.5 cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-lg transition-[transform,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ width: 72 }}
    >
      <div className="w-14 h-14 shrink-0 overflow-hidden rounded-md">
        <ItemAvatar
          name={item.name}
          logo={item.logo}
          containerClass="h-full w-full rounded-md"
        />
      </div>
      <span className="w-full line-clamp-2 text-center text-[10px] leading-tight text-foreground font-medium">
        {item.name}
      </span>
    </button>
  );
}

// ── Single subcategory tier list ──────────────────────────────────────────────

interface SubTierListProps {
  categoryName: string;
  subcategory: Subcategory;
}

function SubTierList({ categoryName, subcategory }: SubTierListProps) {
  const [tierState, setTierState] = useState<Record<string, Tier>>(() =>
    loadTiers(categoryName, subcategory.name),
  );
  const [dragOverZone, setDragOverZone] = useState<Tier | "unranked" | null>(
    null,
  );

  // Reset when subcategory changes
  useEffect(() => {
    setTierState(loadTiers(categoryName, subcategory.name));
  }, [categoryName, subcategory.name]);

  const handleAssign = useCallback(
    (itemName: string, tier: Tier | null) => {
      setTierState((prev) => {
        const next = { ...prev };
        if (tier === null) {
          delete next[itemName];
        } else {
          next[itemName] = tier;
        }
        saveTiers(categoryName, subcategory.name, next);
        return next;
      });
    },
    [categoryName, subcategory.name],
  );

  const handleDrop = useCallback(
    (zone: Tier | "unranked") => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverZone(null);
      const itemName = e.dataTransfer.getData("text/plain");
      if (itemName) handleAssign(itemName, zone === "unranked" ? null : zone);
    },
    [handleAssign],
  );

  const unranked = subcategory.items.filter((item) => !tierState[item.name]);

  return (
    <div className="flex flex-col">
      {TIERS.map((tier) => {
        const tieredItems = subcategory.items.filter(
          (item) => tierState[item.name] === tier.id,
        );
        const isOver = dragOverZone === tier.id;
        return (
          <div
            key={tier.id}
            className="flex items-stretch border-b border-border last:border-b-0 min-h-[80px]"
          >
            <div
              className="flex w-14 shrink-0 items-center justify-center text-base font-black tracking-tight"
              style={{ backgroundColor: tier.color, color: tier.textColor }}
            >
              {tier.id}
            </div>
            <section
              aria-label={`${tier.id} tier drop zone`}
              className={`flex flex-1 flex-wrap items-center gap-2 px-3 py-2 bg-card/50 transition-colors duration-100 ${isOver ? "bg-white/10 outline outline-2 outline-white/20 -outline-offset-2" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverZone(tier.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setDragOverZone(null);
              }}
              onDrop={handleDrop(tier.id)}
            >
              {tieredItems.length === 0 ? (
                <span className="text-[11px] text-muted-foreground/40 italic select-none">
                  — drop here —
                </span>
              ) : (
                tieredItems.map((item) => (
                  <TierItem key={item.name} item={item} />
                ))
              )}
            </section>
          </div>
        );
      })}

      {/* Unranked pool */}
      <section
        aria-label="Unranked drop zone"
        className={`flex items-stretch min-h-[80px] border-t-2 border-border/60 transition-colors duration-100 ${dragOverZone === "unranked" ? "bg-white/5 outline outline-2 outline-white/10 -outline-offset-2" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverZone("unranked");
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setDragOverZone(null);
        }}
        onDrop={handleDrop("unranked")}
      >
        <div className="flex w-14 shrink-0 items-center justify-center bg-muted/80">
          <span
            className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Unranked
          </span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2 px-3 py-2">
          {unranked.length === 0 ? (
            <span className="text-[11px] text-muted-foreground italic">
              All items ranked! 🎉
            </span>
          ) : (
            unranked.map((item) => <TierItem key={item.name} item={item} />)
          )}
        </div>
      </section>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

const DEFAULT_COLOR = "oklch(0.4 0.14 265)";
const DARK_ENDPOINT = "oklch(0.1 0.01 265)";

interface TierListPanelProps {
  categoryName: string;
  categoryColor?: string;
  subcategories: Subcategory[];
  initialTab?: number;
  onClose: () => void;
}

export function TierListPanel({
  categoryName,
  categoryColor,
  subcategories,
  initialTab = 0,
  onClose,
}: TierListPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const activeSub = subcategories[activeTab] ?? subcategories[0];

  const color = categoryColor ?? DEFAULT_COLOR;
  const headerBg = `color-mix(in oklch, ${color} 70%, ${DARK_ENDPOINT})`;

  if (!activeSub) return null;

  return (
    <div className="border-t border-border">
      {/* Header with tabs */}
      <div
        className="flex items-center justify-between gap-2 px-2 py-0"
        style={{ backgroundColor: headerBg }}
      >
        {/* Subcategory tabs */}
        <div className="flex items-center gap-0 overflow-x-auto">
          {subcategories.map((sub, i) => (
            <button
              key={sub.name}
              type="button"
              onClick={() => setActiveTab(i)}
              className="shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none"
              style={
                activeTab === i
                  ? {
                      borderColor: "rgba(255,255,255,0.9)",
                      color: "#fff",
                    }
                  : {
                      borderColor: "transparent",
                      color: "rgba(255,255,255,0.55)",
                    }
              }
            >
              {sub.name}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden sm:block text-[10px] text-white/50">
            Drag to rank · click to view
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tier list"
            className="flex h-7 w-7 items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Active subcategory tier list */}
      <SubTierList
        key={`${categoryName}-${activeSub.name}`}
        categoryName={categoryName}
        subcategory={activeSub}
      />
    </div>
  );
}

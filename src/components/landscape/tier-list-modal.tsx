"use client";

import {
  ClipboardText,
  DownloadSimple,
  Rows,
  ShareNetwork,
} from "@phosphor-icons/react";
import html2canvas from "html2canvas-pro";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LandscapeItem, Subcategory } from "@/types/landscape";
import { ItemAvatar } from "./item-card";

type Tier = "S" | "A" | "B" | "C" | "D" | "E" | "F";

const TIERS: { id: Tier; color: string; textColor: string }[] = [
  { id: "S", color: "oklch(0.52 0.20 145)", textColor: "#fff" },
  { id: "A", color: "oklch(0.62 0.18 120)", textColor: "#fff" },
  { id: "B", color: "oklch(0.70 0.16 90)", textColor: "oklch(0.2 0.08 90)" },
  { id: "C", color: "oklch(0.72 0.15 70)", textColor: "oklch(0.2 0.08 70)" },
  { id: "D", color: "oklch(0.65 0.19 50)", textColor: "#fff" },
  { id: "E", color: "oklch(0.58 0.22 35)", textColor: "#fff" },
  { id: "F", color: "oklch(0.50 0.24 25)", textColor: "#fff" },
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

function TierItem({
  item,
  isSelected,
  onSelect,
}: {
  item: LandscapeItem;
  isSelected: boolean;
  onSelect: (name: string) => void;
}) {
  return (
    <button
      type="button"
      title={item.name}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.name);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onSelect(item.name)}
      className={`flex flex-col items-center gap-1 rounded-lg border-2 bg-card p-1.5 cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isSelected
          ? "border-yellow-400 ring-2 ring-yellow-400/50 scale-105 shadow-lg"
          : "border-border"
      }`}
      style={{ width: 68 }}
    >
      <div className="w-12 h-12 shrink-0 overflow-hidden rounded-md">
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface TierListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  subcategory: Subcategory;
  categoryColor?: string;
}

export function TierListModal({
  open,
  onOpenChange,
  categoryName,
  subcategory,
  categoryColor,
}: TierListModalProps) {
  const tierContentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [tierState, setTierState] = useState<Record<string, Tier>>(() =>
    loadTiers(categoryName, subcategory.name),
  );
  const [dragOverZone, setDragOverZone] = useState<Tier | "unranked" | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const isFullCategory = categoryName === subcategory.name;
  const exportFileName = `ailandscape-${slugify(isFullCategory ? categoryName : subcategory.name)}-tierlist.png`;

  const captureCanvas = useCallback(async () => {
    const el = tierContentRef.current;
    if (!el) return null;
    const placeholders = el.querySelectorAll<HTMLElement>(
      "[data-tier-placeholder]",
    );
    for (const p of placeholders) p.style.visibility = "hidden";
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    for (const p of placeholders) p.style.visibility = "";
    return canvas;
  }, []);

  const handleExportPng = useCallback(async () => {
    setExporting(true);
    const toastId = toast.loading("Generating image...");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = exportFileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("PNG saved!", { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [captureCanvas, exportFileName]);

  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    // Only offer share on touch devices (mobile/tablet), not macOS Safari
    const isTouchDevice = navigator.maxTouchPoints > 0;
    setCanShare(isTouchDevice && !!navigator.share);
  }, []);

  const handleCopyImage = useCallback(async () => {
    setExporting(true);
    const toastId = toast.loading("Generating image...");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Image copied to clipboard!", { id: toastId });
        return;
      }

      // Fallback: download
      const fileName = exportFileName;
      const link = document.createElement("a");
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("PNG saved!", { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [captureCanvas, exportFileName]);

  const handleShareImage = useCallback(async () => {
    setExporting(true);
    const toastId = toast.loading("Generating image...");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      const fileName = exportFileName;
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        toast.dismiss(toastId);
        await navigator.share({
          files: [file],
          title: `Tier List — ${subcategory.name}`,
        });
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      throw e;
    } finally {
      setExporting(false);
    }
  }, [captureCanvas, exportFileName, subcategory.name]);

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

  const handleItemSelect = useCallback((name: string) => {
    setSelectedItem((prev) => (prev === name ? null : name));
  }, []);

  const handleZoneTap = useCallback(
    (zone: Tier | "unranked") => {
      if (!selectedItem) return;
      handleAssign(selectedItem, zone === "unranked" ? null : zone);
      setSelectedItem(null);
    },
    [selectedItem, handleAssign],
  );

  const unranked = subcategory.items.filter((item) => !tierState[item.name]);
  const color = categoryColor ?? "oklch(0.4 0.14 265)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <Rows size={16} style={{ color }} />
            <span>Tier List</span>
            <span className="text-muted-foreground font-normal">—</span>
            <span style={{ color }}>{subcategory.name}</span>
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">
            Drag or tap an item, then tap a tier to place it.
          </p>
          <div className="flex items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={canShare ? handleShareImage : handleCopyImage}
              disabled={exporting}
              title={canShare ? "Share image" : "Copy image"}
              className="flex items-center justify-center gap-1.5 border border-border bg-card font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 sm:flex-none px-4 py-2.5 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] rounded-lg sm:rounded-md"
            >
              {canShare ? (
                <ShareNetwork size={14} />
              ) : (
                <ClipboardText size={14} />
              )}
              {canShare ? "Share" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              disabled={exporting}
              title="Save as PNG"
              className="flex items-center justify-center gap-1.5 border border-border bg-card font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 sm:flex-none px-4 py-2.5 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] rounded-lg sm:rounded-md"
            >
              <DownloadSimple size={14} />
              Save PNG
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Capture area: header + tier rows only */}
          <div ref={tierContentRef} className="flex flex-col">
            <div
              className="flex items-center gap-2 px-3 py-2 border-b border-border"
              style={{
                backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
              }}
            >
              <span className="text-xs font-bold" style={{ color }}>
                {subcategory.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                — ailandscape.org
              </span>
            </div>
            {TIERS.map((tier) => {
              const tieredItems = subcategory.items.filter(
                (item) => tierState[item.name] === tier.id,
              );
              const isOver = dragOverZone === tier.id;
              return (
                <div
                  key={tier.id}
                  className="flex items-stretch border-b border-border last:border-b-0 min-h-[72px]"
                >
                  <div
                    className="flex w-12 shrink-0 items-center justify-center text-sm font-black tracking-tight"
                    style={{
                      backgroundColor: tier.color,
                      color: tier.textColor,
                    }}
                  >
                    {tier.id}
                  </div>
                  <section
                    aria-label={`${tier.id} tier drop zone`}
                    role={selectedItem ? "button" : undefined}
                    tabIndex={selectedItem ? 0 : undefined}
                    className={`flex flex-1 flex-wrap items-center gap-2 px-3 py-2 bg-card/50 transition-colors duration-100 ${
                      isOver
                        ? "bg-accent/20 outline outline-2 outline-accent -outline-offset-2"
                        : selectedItem
                          ? "cursor-pointer hover:bg-accent/10"
                          : ""
                    }`}
                    onClick={() => handleZoneTap(tier.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleZoneTap(tier.id);
                      }
                    }}
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
                      <span
                        data-tier-placeholder
                        className="text-[11px] text-muted-foreground/40 italic select-none"
                      >
                        {selectedItem ? "Tap to place here" : "— drop here —"}
                      </span>
                    ) : (
                      tieredItems.map((item) => (
                        <TierItem
                          key={item.name}
                          item={item}
                          isSelected={selectedItem === item.name}
                          onSelect={handleItemSelect}
                        />
                      ))
                    )}
                  </section>
                </div>
              );
            })}
          </div>

          {/* Unranked pool — outside capture area */}
          <section
            aria-label="Unranked drop zone"
            role={selectedItem ? "button" : undefined}
            tabIndex={selectedItem ? 0 : undefined}
            className={`flex items-stretch min-h-[72px] border-t-2 border-border/60 transition-colors duration-100 ${
              dragOverZone === "unranked"
                ? "bg-accent/10 outline outline-2 outline-accent/40 -outline-offset-2"
                : selectedItem
                  ? "cursor-pointer hover:bg-accent/5"
                  : ""
            }`}
            onClick={() => handleZoneTap("unranked")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleZoneTap("unranked");
              }
            }}
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
            <div className="flex w-12 shrink-0 items-center justify-center bg-muted/80">
              <span
                className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                Unranked
              </span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 px-3 py-2">
              {unranked.length === 0 ? (
                <span className="text-[11px] text-muted-foreground italic">
                  All items ranked!
                </span>
              ) : (
                unranked.map((item) => (
                  <TierItem
                    key={item.name}
                    item={item}
                    isSelected={selectedItem === item.name}
                    onSelect={handleItemSelect}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AccessModel, ItemType } from "@prisma/client";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export type ListingItem = {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  isFree: boolean;
  locked: boolean;
  itemType: ItemType;
  href?: string;
  accessModel?: AccessModel;
  inGoalPath?: boolean;
};

export function CategoryListing({
  title,
  description,
  items,
  layout = "text-first",
  accentColor,
}: {
  title: string;
  description: string;
  items: ListingItem[];
  layout?: "image-first" | "text-first" | "compact-list";
  accentColor?: string | null;
}) {
  const [tab, setTab] = useState<"all" | "library">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const scoped = tab === "library" ? items.filter((item) => !item.locked) : items;
    const needle = query.trim().toLowerCase();
    if (!needle) return scoped;
    return scoped.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.subtitle?.toLowerCase().includes(needle),
    );
  }, [items, query, tab]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary" style={accentColor ? { color: accentColor } : undefined}>
          Catalog
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {(["all", "library"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-semibold",
              tab === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {value === "all" ? "All" : "My library"}
          </button>
        ))}
      </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search this shelf"
          className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:max-w-xs"
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title={
            query.trim()
              ? "No titles match that search"
              : tab === "library"
                ? "Nothing owned here yet"
                : "Nothing in this category"
          }
          description={
            query.trim()
              ? "Try a subject, exam name, or clear the search."
              : tab === "library"
                ? "Free and purchased titles from this category will collect here."
                : "An admin can add items from the content manager."
          }
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            layout === "compact-list" ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {visible.map((item) => (
            <CatalogCard key={item.id} {...item} layout={layout} />
          ))}
        </div>
      )}
    </div>
  );
}

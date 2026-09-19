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
  const visible = useMemo(
    () => (tab === "library" ? items.filter((item) => !item.locked) : items),
    [items, tab],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary" style={accentColor ? { color: accentColor } : undefined}>
          Catalog
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
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
      {visible.length === 0 ? (
        <EmptyState
          title={tab === "library" ? "Nothing owned here yet" : "Nothing in this category"}
          description={
            tab === "library"
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

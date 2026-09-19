"use client";

import { ItemType } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { saveCategoryTemplate } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES: ItemType[] = ["BOOK", "MATERIAL", "PAPER", "EXAM", "NOTICE"];
const LAYOUTS = ["image-first", "text-first", "compact-list"];
const FIELDS = ["price", "subject", "difficulty", "free", "goal"];

export default function AdminCategoriesPage() {
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Category templates</h1>
        <p className="mt-2 text-muted-foreground">
          Config-driven listing layout — card style, visible metadata, accent color.
        </p>
      </div>
      <div className="grid gap-4">
        {CATEGORIES.map((category) => (
          <form
            key={category}
            className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setBusy(true);
              await saveCategoryTemplate({
                categoryType: category,
                cardLayout: String(form.get("cardLayout") ?? "text-first"),
                visibleFields: form.getAll("visibleFields").map(String),
                accentColor: String(form.get("accentColor") || "") || null,
                icon: String(form.get("icon") || "") || null,
              });
              setBusy(false);
              toast.success(`${category} template saved.`);
            }}
          >
            <p className="font-display text-xl md:col-span-2">{category}</p>
            <div className="space-y-1.5">
              <Label>Card layout</Label>
              <select
                name="cardLayout"
                defaultValue="text-first"
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                {LAYOUTS.map((layout) => (
                  <option key={layout} value={layout}>
                    {layout}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Accent color</Label>
              <Input name="accentColor" placeholder="#0f766e" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Visible fields</Label>
              <div className="flex flex-wrap gap-3">
                {FIELDS.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="visibleFields" value={field} defaultChecked={field !== "difficulty"} />
                    {field}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Input name="icon" placeholder="book" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy}>
                Save {category}
              </Button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

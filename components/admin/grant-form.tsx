"use client";

import { useState } from "react";
import { ItemType } from "@prisma/client";
import { toast } from "sonner";
import { grantAccess, toggleUserSuspended } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

type Item = { id: string; title?: string; name?: string };

export function GrantForm({
  userId,
  suspended,
  items,
}: {
  userId: string;
  suspended: boolean;
  items: {
    books: Item[];
    materials: Item[];
    papers: Item[];
    exams: Item[];
    plans: Item[];
  };
}) {
  const [itemType, setItemType] = useState<ItemType>("BOOK");
  const [itemId, setItemId] = useState(items.books[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  const options =
    itemType === "BOOK"
      ? items.books
      : itemType === "MATERIAL"
        ? items.materials
        : itemType === "PAPER"
          ? items.papers
          : itemType === "EXAM"
            ? items.exams
            : items.plans;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          value={itemType}
          onChange={(event) => {
            const next = event.target.value as ItemType;
            setItemType(next);
            const list =
              next === "BOOK"
                ? items.books
                : next === "MATERIAL"
                  ? items.materials
                  : next === "PAPER"
                    ? items.papers
                    : next === "EXAM"
                      ? items.exams
                      : items.plans;
            setItemId(list[0]?.id ?? "");
          }}
        >
          <option value="BOOK">Book</option>
          <option value="MATERIAL">Material</option>
          <option value="PAPER">Paper</option>
          <option value="EXAM">Exam</option>
          <option value="PLAN">Plan</option>
        </select>
        <select
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
        >
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title ?? item.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          disabled={busy || !itemId}
          onClick={async () => {
            setBusy(true);
            const result = await grantAccess({ userId, itemType, itemId });
            setBusy(false);
            if (!result.ok) toast.error(result.error);
            else toast.success("Access granted.");
          }}
        >
          Grant access
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const result = await toggleUserSuspended(userId, !suspended);
          if (!result.ok) toast.error(result.error);
          else toast.success(suspended ? "User reinstated." : "User suspended.");
        }}
      >
        {suspended ? "Reinstate user" : "Suspend user"}
      </Button>
    </div>
  );
}

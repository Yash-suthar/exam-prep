"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItemType } from "@prisma/client";
import { toast } from "sonner";
import { buyItem } from "@/app/actions/purchase";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";

export function BuyButton({
  itemType,
  itemId,
  price,
  locked,
  href,
}: {
  itemType: ItemType;
  itemId: string;
  price: number;
  locked: boolean;
  href?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!locked && href) {
    return (
      <Button asChild>
        <a href={href}>Open</a>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await buyItem(itemType, itemId);
        setBusy(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(
          result.alreadyOwned
            ? "You already have access."
            : "Demo checkout complete. Added to your library.",
        );
        router.refresh();
      }}
    >
      {busy ? "Unlocking…" : `Buy ${formatInr(price)}`}
    </Button>
  );
}

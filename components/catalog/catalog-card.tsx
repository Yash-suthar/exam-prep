import { Lock, Unlock } from "lucide-react";
import { AccessModel, ItemType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyButton } from "@/components/catalog/buy-button";
import { formatInr } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CatalogCard({
  id,
  title,
  subtitle,
  price,
  isFree,
  locked,
  itemType,
  href,
  accessModel,
  inGoalPath,
  layout = "text-first",
}: {
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
  layout?: "image-first" | "text-first" | "compact-list";
}) {
  const model = accessModel ?? (isFree ? "FREE" : "PAID");
  return (
    <Card
      className={cn(
        "flex h-full flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md",
        layout === "compact-list" && "flex-row items-center",
      )}
    >
      {layout === "image-first" ? (
        <div className="h-20 rounded-t-2xl bg-primary/15" />
      ) : null}
      <CardHeader className={cn(layout === "compact-list" && "flex-1 py-3")}>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {locked ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <Unlock className="h-4 w-4 shrink-0 text-primary" />
          )}
        </div>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {inGoalPath ? <Badge tone="accent">In your goal path</Badge> : null}
          {model === "FREE" || isFree ? <Badge tone="success">Free</Badge> : null}
          {model === "FREE_TRIAL" ? <Badge tone="warning">Trial</Badge> : null}
          {model === "PAID" && !isFree ? <Badge>{formatInr(price)}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("mt-auto", layout === "compact-list" && "mt-0 py-3")}>
        <BuyButton
          itemType={itemType}
          itemId={id}
          price={price}
          locked={locked}
          href={href}
        />
      </CardContent>
    </Card>
  );
}

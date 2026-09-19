import { Lock, Unlock } from "lucide-react";
import { ItemType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyButton } from "@/components/catalog/buy-button";
import { formatInr } from "@/lib/utils";

export function CatalogCard({
  id,
  title,
  subtitle,
  price,
  isFree,
  locked,
  itemType,
  href,
}: {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  isFree: boolean;
  locked: boolean;
  itemType: ItemType;
  href?: string;
}) {
  return (
    <Card className="flex h-full flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {locked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Unlock className="h-4 w-4 text-primary" />
          )}
        </div>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isFree ? <Badge tone="success">Free</Badge> : <Badge>{formatInr(price)}</Badge>}
        </div>
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

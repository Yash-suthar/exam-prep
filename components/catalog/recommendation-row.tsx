import Link from "next/link";
import { CatalogCard } from "@/components/catalog/catalog-card";
import type { RecItem } from "@/lib/recommendations";

export function RecommendationRow({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: RecItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-primary">
          Show all →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="min-w-[16.5rem] snap-start md:min-w-0">
            <CatalogCard
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              price={item.price}
              isFree={item.isFree}
              locked={item.locked}
              itemType={item.itemType}
              href={item.href}
              accessModel={item.accessModel}
              inGoalPath={item.inGoalPath}
              layout="image-first"
            />
          </div>
        ))}
        <Link
          href={href}
          className="flex min-w-[10rem] snap-start items-center justify-center rounded-2xl border border-dashed border-border text-sm font-semibold text-primary md:hidden"
        >
          Show all →
        </Link>
      </div>
    </section>
  );
}

import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function MaterialsPage() {
  const user = await requireUser();
  const materials = await prisma.studyMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (materials.length === 0) {
    return (
      <EmptyState
        title="No study materials yet"
        description="Notes and compilations will appear here once an admin uploads them."
      />
    );
  }

  const cards = await Promise.all(
    materials.map(async (material) => ({
      material,
      allowed: await hasAccess(user.id, "MATERIAL", material.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Study materials</h1>
        <p className="mt-2 text-muted-foreground">
          Short notes and compilations. Demo checkout unlocks them instantly.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ material, allowed }) => (
          <CatalogCard
            key={material.id}
            id={material.id}
            title={material.title}
            subtitle={material.tags.join(" · ")}
            price={material.price}
            isFree={material.isFree}
            locked={!allowed}
            itemType="MATERIAL"
            href={allowed ? "/library" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

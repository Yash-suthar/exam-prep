import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function PapersPage() {
  const user = await requireUser();
  const papers = await prisma.paper.findMany({
    include: { subject: true },
    orderBy: { year: "desc" },
  });

  if (papers.length === 0) {
    return (
      <EmptyState
        title="No previous papers yet"
        description="Year-wise papers will show up here after upload."
      />
    );
  }

  const cards = await Promise.all(
    papers.map(async (paper) => ({
      paper,
      allowed: await hasAccess(user.id, "PAPER", paper.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Previous papers</h1>
        <p className="mt-2 text-muted-foreground">
          Official-style PDFs. Access is checked on the server before a file URL is issued.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ paper, allowed }) => (
          <CatalogCard
            key={paper.id}
            id={paper.id}
            title={paper.title}
            subtitle={`${paper.subject.name}${paper.year ? ` · ${paper.year}` : ""}`}
            price={paper.price}
            isFree={paper.isFree}
            locked={!allowed}
            itemType="PAPER"
            href={allowed ? "/library" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

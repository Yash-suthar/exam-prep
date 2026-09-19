import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function BooksPage() {
  const user = await requireUser();
  const books = await prisma.book.findMany({
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });

  if (books.length === 0) {
    return (
      <EmptyState
        title="No books yet"
        description="Admins can add subject-wise books from the content manager."
      />
    );
  }

  const cards = await Promise.all(
    books.map(async (book) => ({
      book,
      allowed: await hasAccess(user.id, "BOOK", book.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Books</h1>
        <p className="mt-2 text-muted-foreground">
          Browse by subject. Locked titles stay visible so you can decide what to buy.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ book, allowed }) => (
          <CatalogCard
            key={book.id}
            id={book.id}
            title={book.title}
            subtitle={book.subject.name}
            price={book.price}
            isFree={book.isFree}
            locked={!allowed}
            itemType="BOOK"
            href={allowed ? `/library` : undefined}
          />
        ))}
      </div>
    </div>
  );
}

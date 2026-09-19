import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { readerHref } from "@/lib/reader-links";
import { requireUser } from "@/lib/session";

export default async function LibraryPage() {
  const user = await requireUser();
  const [books, materials, papers, exams] = await Promise.all([
    prisma.book.findMany({ include: { subject: true } }),
    prisma.studyMaterial.findMany(),
    prisma.paper.findMany({ include: { subject: true } }),
    prisma.exam.findMany({ where: { isPublished: true } }),
  ]);

  const ownedBooks = (
    await Promise.all(
      books.map(async (book) =>
        (await hasAccess(user.id, "BOOK", book.id)) ? book : null,
      ),
    )
  ).filter(Boolean);
  const ownedMaterials = (
    await Promise.all(
      materials.map(async (material) =>
        (await hasAccess(user.id, "MATERIAL", material.id)) ? material : null,
      ),
    )
  ).filter(Boolean);
  const ownedPapers = (
    await Promise.all(
      papers.map(async (paper) =>
        (await hasAccess(user.id, "PAPER", paper.id)) ? paper : null,
      ),
    )
  ).filter(Boolean);
  const ownedExams = (
    await Promise.all(
      exams.map(async (exam) =>
        (await hasAccess(user.id, "EXAM", exam.id)) ? exam : null,
      ),
    )
  ).filter(Boolean);

  const empty =
    ownedBooks.length +
      ownedMaterials.length +
      ownedPapers.length +
      ownedExams.length ===
    0;

  if (empty) {
    return (
      <EmptyState
        title="Your library is empty"
        description="Buy a book or take the free mock to start filling this shelf."
        actionHref="/books"
        actionLabel="Browse books"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">My library</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you purchased, were granted, or that is free.
        </p>
      </div>
      <Section title="Books">
        {ownedBooks.map((book) =>
          book ? (
            <CatalogCard
              key={book.id}
              id={book.id}
              title={book.title}
              subtitle={book.subject.name}
              price={book.price}
              isFree={book.isFree}
              locked={false}
              itemType="BOOK"
              href={readerHref("BOOK", book.id)}
            />
          ) : null,
        )}
      </Section>
      <Section title="Materials">
        {ownedMaterials.map((material) =>
          material ? (
            <CatalogCard
              key={material.id}
              id={material.id}
              title={material.title}
              subtitle={material.tags.join(" · ")}
              price={material.price}
              isFree={material.isFree}
              locked={false}
              itemType="MATERIAL"
              href={readerHref("MATERIAL", material.id)}
            />
          ) : null,
        )}
      </Section>
      <Section title="Papers">
        {ownedPapers.map((paper) =>
          paper ? (
            <CatalogCard
              key={paper.id}
              id={paper.id}
              title={paper.title}
              subtitle={paper.subject.name}
              price={paper.price}
              isFree={paper.isFree}
              locked={false}
              itemType="PAPER"
              href={readerHref("PAPER", paper.id)}
            />
          ) : null,
        )}
      </Section>
      <Section title="Exams">
        {ownedExams.map((exam) =>
          exam ? (
            <CatalogCard
              key={exam.id}
              id={exam.id}
              title={exam.title}
              subtitle={`${exam.totalQuestions} questions`}
              price={exam.price}
              isFree={exam.isFree}
              locked={false}
              itemType="EXAM"
              href={`/exams/${exam.id}/instructions`}
            />
          ) : null,
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

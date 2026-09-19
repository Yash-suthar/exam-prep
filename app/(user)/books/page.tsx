import { CategoryListing } from "@/components/catalog/category-listing";
import { getStudentContext } from "@/lib/audience";
import { getCategoryTemplate } from "@/lib/category-templates";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function BooksPage() {
  const user = await requireUser();
  const [{ activeGoalTag }, template, books] = await Promise.all([
    getStudentContext(user.id),
    getCategoryTemplate("BOOK"),
    prisma.book.findMany({ include: { subject: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const items = await Promise.all(
    books.map(async (book) => ({
      id: book.id,
      title: book.title,
      subtitle: book.subject.name,
      price: book.price,
      isFree: book.isFree || book.accessModel === "FREE",
      locked: !(await hasAccess(user.id, "BOOK", book.id)),
      itemType: "BOOK" as const,
      href: "/library",
      accessModel: book.accessModel,
      inGoalPath: Boolean(activeGoalTag && book.targetExamGoals.includes(activeGoalTag)),
    })),
  );

  return (
    <CategoryListing
      title="Books"
      description="Browse by subject. Locked titles stay visible so you can decide what to buy."
      items={items}
      layout={template.cardLayout}
      accentColor={template.accentColor}
    />
  );
}

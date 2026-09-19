import { CategoryListing } from "@/components/catalog/category-listing";
import { getStudentContext } from "@/lib/audience";
import { getCategoryTemplate } from "@/lib/category-templates";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function PapersPage() {
  const user = await requireUser();
  const [{ activeGoalTag }, template, papers] = await Promise.all([
    getStudentContext(user.id),
    getCategoryTemplate("PAPER"),
    prisma.paper.findMany({ include: { subject: true }, orderBy: { year: "desc" } }),
  ]);

  const items = await Promise.all(
    papers.map(async (paper) => ({
      id: paper.id,
      title: paper.title,
      subtitle: `${paper.subject.name}${paper.year ? ` · ${paper.year}` : ""}`,
      price: paper.price,
      isFree: paper.isFree || paper.accessModel === "FREE",
      locked: !(await hasAccess(user.id, "PAPER", paper.id)),
      itemType: "PAPER" as const,
      href: "/library",
      accessModel: paper.accessModel,
      inGoalPath: Boolean(activeGoalTag && paper.targetExamGoals.includes(activeGoalTag)),
    })),
  );

  return (
    <CategoryListing
      title="Previous papers"
      description="Official-style PDFs. Access is checked on the server before a file URL is issued."
      items={items}
      layout={template.cardLayout}
      accentColor={template.accentColor}
    />
  );
}

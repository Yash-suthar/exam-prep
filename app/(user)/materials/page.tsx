import { CategoryListing } from "@/components/catalog/category-listing";
import { getStudentContext } from "@/lib/audience";
import { getCategoryTemplate } from "@/lib/category-templates";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function MaterialsPage() {
  const user = await requireUser();
  const [{ activeGoalTag }, template, materials] = await Promise.all([
    getStudentContext(user.id),
    getCategoryTemplate("MATERIAL"),
    prisma.studyMaterial.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const items = await Promise.all(
    materials.map(async (material) => ({
      id: material.id,
      title: material.title,
      subtitle: material.tags.join(" · "),
      price: material.price,
      isFree: material.isFree || material.accessModel === "FREE",
      locked: !(await hasAccess(user.id, "MATERIAL", material.id)),
      itemType: "MATERIAL" as const,
      href: "/library",
      accessModel: material.accessModel,
      inGoalPath: Boolean(activeGoalTag && material.targetExamGoals.includes(activeGoalTag)),
    })),
  );

  return (
    <CategoryListing
      title="Study materials"
      description="Short notes and compilations. Demo checkout unlocks them instantly."
      items={items}
      layout={template.cardLayout}
      accentColor={template.accentColor}
    />
  );
}

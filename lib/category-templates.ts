import { ItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCategoryTemplate(categoryType: ItemType) {
  const template = await prisma.categoryTemplate.findUnique({
    where: { categoryType },
  });
  return {
    cardLayout: (template?.cardLayout ?? "text-first") as
      | "image-first"
      | "text-first"
      | "compact-list",
    visibleFields: template?.visibleFields ?? ["price", "subject"],
    accentColor: template?.accentColor ?? null,
    icon: template?.icon ?? null,
  };
}

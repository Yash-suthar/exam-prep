import { ItemType } from "@prisma/client";

const SEGMENTS: Partial<Record<ItemType, string>> = {
  BOOK: "book",
  MATERIAL: "material",
  PAPER: "paper",
};

export const READABLE_TYPES = Object.keys(SEGMENTS) as ItemType[];

export function readerHref(itemType: ItemType, itemId: string) {
  if (itemType === "EXAM") return `/exams/${itemId}/instructions`;
  const segment = SEGMENTS[itemType];
  return segment ? `/read/${segment}/${itemId}` : undefined;
}

export function itemTypeFromSegment(segment: string): ItemType | null {
  const match = Object.entries(SEGMENTS).find(([, value]) => value === segment);
  return (match?.[0] as ItemType) ?? null;
}

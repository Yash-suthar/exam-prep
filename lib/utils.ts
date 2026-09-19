import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export { optionLabelsFor as optionLabels } from "@/lib/marking";

export function itemTypeLabel(type: string) {
  switch (type) {
    case "BOOK":
      return "Book";
    case "MATERIAL":
      return "Study material";
    case "PAPER":
      return "Previous paper";
    case "PLAN":
      return "Plan";
    case "EXAM":
      return "Exam";
    default:
      return type;
  }
}

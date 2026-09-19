import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "default" | "success" | "warning" | "locked" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "default" && "bg-muted text-foreground",
        tone === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        tone === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
        tone === "locked" && "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
        tone === "accent" && "bg-primary/10 text-primary",
        className,
      )}
      {...props}
    />
  );
}

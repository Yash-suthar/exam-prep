import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
        M
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        MeritPath
      </span>
    </Link>
  );
}

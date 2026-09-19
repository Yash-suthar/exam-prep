import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { requireUser } from "@/lib/session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-lg px-4 py-6 sm:py-10">{children}</main>
    </div>
  );
}

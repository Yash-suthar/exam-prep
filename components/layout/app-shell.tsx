import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ContinueExamBanner } from "@/components/exam/continue-exam-banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const userLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/exams", label: "Exams" },
  { href: "/books", label: "Books" },
  { href: "/materials", label: "Materials" },
  { href: "/papers", label: "Papers" },
  { href: "/library", label: "My library" },
  { href: "/notices", label: "Notices" },
  { href: "/profile", label: "Profile" },
];

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AppShell({
  children,
  role,
  viewerRole,
  inProgress,
}: {
  children: React.ReactNode;
  role: "ADMIN" | "USER";
  viewerRole?: "ADMIN" | "USER";
  inProgress?: { examId: string; title: string } | null;
}) {
  const links = role === "ADMIN" ? adminLinks : userLinks;

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            {role === "ADMIN" ? (
              <Button asChild variant="ghost">
                <Link href="/dashboard">Student view</Link>
              </Button>
            ) : null}
            {viewerRole === "ADMIN" && role === "USER" ? (
              <Button asChild variant="ghost">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <ThemeToggle />
            <form action={logoutUser}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>
      {inProgress ? <ContinueExamBanner exam={inProgress} /> : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

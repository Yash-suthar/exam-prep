import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Flag,
  Home,
  LayoutDashboard,
  Megaphone,
  UserRound,
  Users,
} from "lucide-react";
import { logoutUser } from "@/app/actions/auth";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ContinueExamBanner } from "@/components/exam/continue-exam-banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const userLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/goals", label: "Goal" },
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
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/analytics", label: "Analytics" },
];

const studentMobileNav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/goals", label: "Goal", icon: Flag },
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/notices", label: "Notices", icon: Megaphone },
  { href: "/profile", label: "You", icon: UserRound },
];

const adminMobileNav = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/exams", label: "Exams", icon: ClipboardList },
  { href: "/admin/notices", label: "Notices", icon: Megaphone },
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
  const mobileNav = role === "ADMIN" ? adminMobileNav : studentMobileNav;

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16">
          <Logo href={role === "ADMIN" ? "/admin" : "/dashboard"} />
          <div className="flex items-center gap-2">
            {role === "ADMIN" ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Student preview</Link>
              </Button>
            ) : null}
            {viewerRole === "ADMIN" && role === "USER" ? (
              <Button asChild size="sm">
                <Link href="/admin">Admin console</Link>
              </Button>
            ) : null}
            <ThemeToggle />
            <form action={logoutUser}>
              <Button type="submit" variant="outline" size="sm">
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
      {role === "ADMIN" ? (
        <div className="border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-xs font-semibold text-primary">
          Admin console — create, edit, and delete catalog items, exams, notices, and users
        </div>
      ) : null}
      {inProgress ? <ContinueExamBanner exam={inProgress} /> : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

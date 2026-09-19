import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader({
  user,
}: {
  user?: { name?: string | null; role?: string } | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/exams" className="hover:text-foreground">
            Mock exams
          </Link>
          <Link href="/books" className="hover:text-foreground">
            Books
          </Link>
          <Link href="/notices" className="hover:text-foreground">
            Notices
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                  {user.role === "ADMIN" ? "Admin" : "Dashboard"}
                </Link>
              </Button>
              <form action={logoutUser}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

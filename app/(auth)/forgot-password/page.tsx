import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="font-display text-3xl font-semibold">Reset password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Email reset is not wired in this first slice. Use a demo account or ask an
          admin to grant a fresh login.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/login" className="font-semibold text-primary">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

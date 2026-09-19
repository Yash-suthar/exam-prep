import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/layout/logo";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Logo className="mb-6" />
        <h1 className="font-display text-3xl font-semibold">Start preparing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a student account to browse the catalog and take the free mock.
        </p>
        <AuthForm action={registerUser} submitLabel="Create account" withName />
        <p className="mt-6 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
